import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { KeyboardEvent } from 'react';
import { Send, MessageSquare, MessageSquareOff } from 'lucide-react';

// ============ Types ============
export interface DanmakuItem {
  id: number;
  text: string;
  time: number;
  color: string;
  mode: number;
}

export interface DanmakuEngineHandle {
  onTimeUpdate: (time: number) => void;
  addDanmaku: (d: Omit<DanmakuItem, 'id'>) => void;
  toggle: () => void;
  isEnabled: () => boolean;
}

interface DanmakuEngineProps {
  danmakuList?: DanmakuItem[];
  onSendDanmaku?: (d: { text: string; color: string; mode: number }) => void;
}

// ============ Mock Data ============
export const mockDanmakus: DanmakuItem[] = [
  { id: 1, text: '来了来了', time: 1, color: '#ffffff', mode: 0 },
  { id: 2, text: '建造者密度150+', time: 3, color: '#CD5700', mode: 0 },
  { id: 3, text: '裂缝递砖建造者', time: 5, color: '#FFE411', mode: 0 },
  { id: 4, text: 'ymm牛逼', time: 7, color: '#00ff00', mode: 0 },
  { id: 5, text: '0', time: 9, color: '#ffffff', mode: 0 },
  { id: 6, text: '前方高能', time: 12, color: '#ff0000', mode: 1 },
  { id: 7, text: '卧槽，这也太强了', time: 15, color: '#00BFFF', mode: 0 },
  { id: 8, text: '弹幕护体', time: 18, color: '#FF69B4', mode: 0 },
  { id: 9, text: '第一！！！', time: 2, color: '#FFD700', mode: 0 },
  { id: 10, text: '火钳刘明', time: 22, color: '#ffffff', mode: 0 },
  { id: 11, text: '6666666', time: 25, color: '#00ff00', mode: 0 },
  { id: 12, text: '这代码写得真好', time: 28, color: '#87CEEB', mode: 0 },
  { id: 13, text: 'React yyds', time: 31, color: '#61DAFB', mode: 0 },
  { id: 14, text: '感谢UP主分享', time: 35, color: '#FFA500', mode: 0 },
  { id: 15, text: '已三连', time: 38, color: '#CD5700', mode: 1 },
  { id: 16, text: '下次一定', time: 42, color: '#ffffff', mode: 0 },
  { id: 17, text: '这也太肝了', time: 45, color: '#FF6347', mode: 0 },
  { id: 18, text: '学习到了', time: 48, color: '#90EE90', mode: 0 },
  { id: 19, text: '求源码链接', time: 52, color: '#DDA0DD', mode: 0 },
  { id: 20, text: '这UI真好看', time: 55, color: '#FFE411', mode: 0 },
  { id: 21, text: 'FullStack OP', time: 58, color: '#00CED1', mode: 0 },
  { id: 22, text: 'B站风格好评', time: 62, color: '#CD5700', mode: 0 },
  { id: 23, text: '弹幕测试233', time: 65, color: '#ffffff', mode: 2 },
  { id: 24, text: '太细了', time: 68, color: '#ADFF2F', mode: 0 },
  { id: 25, text: '从入门到入土', time: 72, color: '#FFA07A', mode: 0 },
  { id: 26, text: '这就是大佬吗', time: 75, color: '#FFB6C1', mode: 0 },
  { id: 27, text: '打卡', time: 78, color: '#20B2AA', mode: 0 },
  { id: 28, text: '居然还有弹幕系统', time: 82, color: '#87CEFA', mode: 0 },
  { id: 29, text: '完结撒花', time: 86, color: '#FFD700', mode: 1 },
  { id: 30, text: '期待下一个视频', time: 90, color: '#FF69B4', mode: 0 },
];

// ============ Internal Types ============
interface ActiveDanmaku {
  id: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  mode: number;
  speed: number;
  opacity: number;
  fontSize: number;
  trackIndex: number;
  startTime: number;
  duration: number;
}

const TRACK_COUNT = 8;
const FONT_SIZE = 18;
const LINE_HEIGHT = 24;
const SCROLL_SPEED_BASE = 120;

const DanmakuEngine = forwardRef<DanmakuEngineHandle, DanmakuEngineProps>(
  ({ danmakuList = mockDanmakus, onSendDanmaku }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeDanmakusRef = useRef<ActiveDanmaku[]>([]);
    const enabledRef = useRef(true);
    const lastVideoTimeRef = useRef(0);
    const sentIdsRef = useRef<Set<number>>(new Set());
    const animationFrameRef = useRef<number>(0);
    const [enabled, setEnabled] = useState(true);
    const [inputText, setInputText] = useState('');
    const [danmakuColor, setDanmakuColor] = useState('#ffffff');
    const [danmakuMode, setDanmakuMode] = useState(0);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const colorOptions = [
      '#ffffff',
      '#CD5700',
      '#FFE411',
      '#00ff00',
      '#00BFFF',
      '#ff0000',
      '#FFA500',
      '#FFD700',
    ];

    const measureText = useCallback(
      (text: string, fontSize: number): number => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return text.length * fontSize;
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`;
        return ctx.measureText(text).width;
      },
      []
    );

    const getAvailableTrack = useCallback((): number => {
      const tracks = new Array(TRACK_COUNT).fill(true);
      for (const d of activeDanmakusRef.current) {
        if (d.mode !== 0) continue;
        const rightEdge = d.x + d.width;
        if (rightEdge > containerSize.width - 20) {
          tracks[d.trackIndex] = false;
        }
      }
      const available = tracks.map((v, i) => (v ? i : -1)).filter((i) => i !== -1);
      if (available.length === 0) return Math.floor(Math.random() * TRACK_COUNT);
      return available[Math.floor(Math.random() * available.length)];
    }, [containerSize]);

    const spawnDanmaku = useCallback(
      (item: DanmakuItem) => {
        if (containerSize.width === 0) return;
        const textWidth = measureText(item.text, FONT_SIZE);
        const trackIndex = item.mode === 0 ? getAvailableTrack() : 0;

        let y: number;
        if (item.mode === 0) {
          y = trackIndex * LINE_HEIGHT + LINE_HEIGHT;
        } else if (item.mode === 1) {
          y = (item.id % TRACK_COUNT) * LINE_HEIGHT + LINE_HEIGHT;
        } else {
          y = containerSize.height - ((item.id % TRACK_COUNT) * LINE_HEIGHT + LINE_HEIGHT);
        }

        const duration =
          item.mode === 0
            ? (containerSize.width + textWidth) / SCROLL_SPEED_BASE
            : 4;

        const active: ActiveDanmaku = {
          id: item.id,
          text: item.text,
          x: item.mode === 0 ? containerSize.width : (containerSize.width - textWidth) / 2,
          y,
          width: textWidth,
          height: LINE_HEIGHT,
          color: item.color,
          mode: item.mode,
          speed: item.mode === 0 ? SCROLL_SPEED_BASE : 0,
          opacity: 1,
          fontSize: FONT_SIZE,
          trackIndex,
          startTime: performance.now(),
          duration,
        };

        activeDanmakusRef.current.push(active);
      },
      [containerSize, measureText, getAvailableTrack]
    );

    const onTimeUpdate = useCallback(
      (time: number) => {
        lastVideoTimeRef.current = time;
        if (!enabledRef.current) return;
        for (const item of danmakuList) {
          if (sentIdsRef.current.has(item.id)) continue;
          if (Math.abs(item.time - time) < 0.5) {
            sentIdsRef.current.add(item.id);
            spawnDanmaku(item);
          }
        }
      },
      [danmakuList, spawnDanmaku]
    );

    const addDanmaku = useCallback(
      (d: Omit<DanmakuItem, 'id'>) => {
        const newItem: DanmakuItem = {
          ...d,
          id: Date.now() + Math.floor(Math.random() * 10000),
        };
        spawnDanmaku(newItem);
      },
      [spawnDanmaku]
    );

    const toggle = useCallback(() => {
      enabledRef.current = !enabledRef.current;
      setEnabled(enabledRef.current);
      if (!enabledRef.current) {
        activeDanmakusRef.current = [];
      }
    }, []);

    const isEnabled = useCallback(() => enabledRef.current, []);

    useImperativeHandle(ref, () => ({
      onTimeUpdate,
      addDanmaku,
      toggle,
      isEnabled,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let running = true;
      const render = () => {
        if (!running) return;
        const now = performance.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (enabledRef.current) {
          const active = activeDanmakusRef.current;
          for (let i = active.length - 1; i >= 0; i--) {
            const d = active[i];
            const elapsed = (now - d.startTime) / 1000;

            if (elapsed > d.duration + 1) {
              active.splice(i, 1);
              continue;
            }

            if (d.mode === 0) {
              d.x = containerSize.width + d.width - elapsed * d.speed;
            }

            if (elapsed < 0.3) {
              d.opacity = elapsed / 0.3;
            } else if (elapsed > d.duration - 0.3) {
              d.opacity = Math.max(0, (d.duration - elapsed) / 0.3);
            } else {
              d.opacity = 1;
            }

            ctx.save();
            ctx.globalAlpha = Math.min(1, Math.max(0, d.opacity));
            ctx.font = `bold ${d.fontSize}px "Microsoft YaHei", sans-serif`;
            ctx.fillStyle = d.color;
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(d.text, d.x, d.y);
            ctx.restore();
          }
        }

        animationFrameRef.current = requestAnimationFrame(render);
      };

      animationFrameRef.current = requestAnimationFrame(render);
      return () => {
        running = false;
        cancelAnimationFrame(animationFrameRef.current);
      };
    }, [containerSize]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setContainerSize({ width, height });
          if (canvasRef.current) {
            const dpr = window.devicePixelRatio || 1;
            canvasRef.current.width = Math.floor(width * dpr);
            canvasRef.current.height = Math.floor(height * dpr);
            canvasRef.current.style.width = `${width}px`;
            canvasRef.current.style.height = `${height}px`;
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.scale(dpr, dpr);
          }
        }
      });

      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }, []);

    const handleSend = useCallback(() => {
      if (!inputText.trim()) return;
      const newDanmaku = {
        text: inputText.trim(),
        time: lastVideoTimeRef.current,
        color: danmakuColor,
        mode: danmakuMode,
      };
      addDanmaku(newDanmaku);
      onSendDanmaku?.(newDanmaku);
      setInputText('');
    }, [inputText, danmakuColor, danmakuMode, addDanmaku, onSendDanmaku]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
      },
      [handleSend]
    );

    return (
      <div className="flex flex-col gap-2">
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
          <button
            onClick={toggle}
            className={`p-1.5 rounded transition-colors ${
              enabled
                ? 'text-[#CD5700] bg-[#CD5700]/10'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={enabled ? '关闭弹幕' : '开启弹幕'}
          >
            {enabled ? <MessageSquare className="w-4 h-4" /> : <MessageSquareOff className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-0.5">
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => setDanmakuColor(c)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  danmakuColor === c ? 'scale-125 border-gray-600' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <select
            value={danmakuMode}
            onChange={(e) => setDanmakuMode(Number(e.target.value))}
            className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 outline-none focus:border-[#CD5700]"
          >
            <option value={0}>滚动</option>
            <option value={1}>顶部</option>
            <option value={2}>底部</option>
          </select>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发一条弹幕吧~"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
          />

          <button
            onClick={handleSend}
            className="flex items-center gap-1 bg-[#CD5700] text-white px-3 py-1 rounded text-sm hover:bg-[#fb5b85] transition-colors disabled:opacity-50"
            disabled={!inputText.trim()}
          >
            <Send className="w-3 h-3" />
            发送
          </button>
        </div>
      </div>
    );
  }
);

DanmakuEngine.displayName = 'DanmakuEngine';
export default DanmakuEngine;
