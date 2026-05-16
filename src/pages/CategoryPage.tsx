import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Play,
  Clock,
  Flame,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react'

/* ─── types ─── */
interface VideoItem {
  id: string
  title: string
  cover: string
  views: number
  duration: string
  date: string
  author: string
  authorAvatar: string
  category: string
  subCategory: string
}

/* ─── category data ─── */
const categories = [
  { name: '动画', slug: 'anime', subs: ['MAD·AMV', 'MMD·3D', '短动画', '综合'] },
  { name: '音乐', slug: 'music', subs: ['翻唱', 'VOCALOID', '原创音乐', '音乐现场'] },
  { name: '科技', slug: 'tech', subs: ['数码', '编程', 'AI', '科普'] },
  { name: '知识', slug: 'knowledge', subs: ['人文历史', '社科法律', '自然科学', '职场'] },
  { name: '生活', slug: 'life', subs: ['日常', '美食', '动物', '手工'] },
  { name: '游戏', slug: 'game', subs: ['单机', '网游', '电竞', '手游'] },
]

const sortOptions = [
  { value: 'newest', label: '最新', icon: Calendar },
  { value: 'hottest', label: '最热', icon: Flame },
  { value: 'most-played', label: '最多播放', icon: TrendingUp },
] as const

/* ─── mock videos ─── */
const mockVideos: VideoItem[] = [
  { id: 'c1', title: '【MAD】裂缝递砖建造者 - 致每一个在黑暗中前行的你', cover: 'https://picsum.photos/320/180?random=11', views: 45200, duration: '04:32', date: '2024-05-20', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: 'anime', subCategory: 'MAD·AMV' },
  { id: 'c2', title: '【MMD】白桦树的四季变迁 / 4K画质', cover: 'https://picsum.photos/320/180?random=12', views: 12800, duration: '03:45', date: '2024-05-18', author: 'MikuFans', authorAvatar: 'https://picsum.photos/40/40?random=b', category: 'anime', subCategory: 'MMD·3D' },
  { id: 'c3', title: '6小时原创短动画：建造者的一天', cover: 'https://picsum.photos/320/180?random=13', views: 35600, duration: '08:12', date: '2024-05-15', author: '动画工坊', authorAvatar: 'https://picsum.photos/40/40?random=c', category: 'anime', subCategory: '短动画' },
  { id: 'c4', title: '综合创作：裂缝中的光芒 | 手绘动画', cover: 'https://picsum.photos/320/180?random=14', views: 8900, duration: '05:28', date: '2024-05-10', author: '手绘达人', authorAvatar: 'https://picsum.photos/40/40?random=d', category: 'anime', subCategory: '综合' },
  { id: 'c5', title: '【翻唱】裂缝递砖建造者 - 原版COVER', cover: 'https://picsum.photos/320/180?random=15', views: 67800, duration: '04:15', date: '2024-05-22', author: '音乐小屋', authorAvatar: 'https://picsum.photos/40/40?random=e', category: 'music', subCategory: '翻唱' },
  { id: 'c6', title: '【VOCALOID】Sukačev / feat. 初音未来', cover: 'https://picsum.photos/320/180?random=16', views: 23100, duration: '03:58', date: '2024-05-19', author: 'VocaloidP', authorAvatar: 'https://picsum.photos/40/40?random=f', category: 'music', subCategory: 'VOCALOID' },
  { id: 'c7', title: '从零开始学React：6小时全栈开发实战', cover: 'https://picsum.photos/320/180?random=17', views: 124000, duration: '6:12:00', date: '2024-05-21', author: 'CodeMaster', authorAvatar: 'https://picsum.photos/40/40?random=g', category: 'tech', subCategory: '编程' },
  { id: 'c8', title: 'GPT-5 会取代程序员吗？深度分析', cover: 'https://picsum.photos/320/180?random=18', views: 89200, duration: '22:35', date: '2024-05-17', author: 'AI观察', authorAvatar: 'https://picsum.photos/40/40?random=h', category: 'tech', subCategory: 'AI' },
  { id: 'c9', title: 'BDI 150+ 是什么体验？心理学深度解读', cover: 'https://picsum.photos/320/180?random=19', views: 44500, duration: '18:40', date: '2024-05-16', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: 'knowledge', subCategory: '社科法律' },
  { id: 'c10', title: 'MyGO!!!!! 剧情心理学分析 | 少女们的呐喊', cover: 'https://picsum.photos/320/180?random=20', views: 56700, duration: '28:15', date: '2024-05-14', author: '番剧解析', authorAvatar: 'https://picsum.photos/40/40?random=i', category: 'knowledge', subCategory: '人文历史' },
  { id: 'c11', title: '山村生活Vlog：清晨的雾与田间的路', cover: 'https://picsum.photos/320/180?random=21', views: 32100, duration: '12:08', date: '2024-05-23', author: '田园日记', authorAvatar: 'https://picsum.photos/40/40?random=j', category: 'life', subCategory: '日常' },
  { id: 'c12', title: '手冲咖啡入门指南 | 从豆子到杯子的仪式感', cover: 'https://picsum.photos/320/180?random=22', views: 18900, duration: '09:45', date: '2024-05-12', author: '咖啡匠人', authorAvatar: 'https://picsum.photos/40/40?random=k', category: 'life', subCategory: '美食' },
  { id: 'c13', title: '艾尔登法环 DLC 全Boss无伤通关', cover: 'https://picsum.photos/320/180?random=23', views: 98700, duration: '45:20', date: '2024-05-22', author: '游戏大手', authorAvatar: 'https://picsum.photos/40/40?random=l', category: 'game', subCategory: '单机' },
  { id: 'c14', title: 'LOL 2024 MSI 决赛精彩回顾', cover: 'https://picsum.photos/320/180?random=24', views: 156000, duration: '15:30', date: '2024-05-20', author: '电竞前线', authorAvatar: 'https://picsum.photos/40/40?random=m', category: 'game', subCategory: '电竞' },
  { id: 'c15', title: '原神 4.7 版本新角色深度测评', cover: 'https://picsum.photos/320/180?random=25', views: 223000, duration: '11:45', date: '2024-05-23', author: '手游测评', authorAvatar: 'https://picsum.photos/40/40?random=n', category: 'game', subCategory: '手游' },
  { id: 'c16', title: '【科普】双相情感障碍：认识情绪的跷跷板', cover: 'https://picsum.photos/320/180?random=26', views: 33400, duration: '14:22', date: '2024-05-11', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: 'tech', subCategory: '科普' },
]

/* ─── helpers ─── */
function formatNumber(n: number) {
  if (n >= 100000) return (n / 10000).toFixed(0) + '万'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

/* ─── video card (horizontal) ─── */
function VideoListItem({ v }: { v: VideoItem }) {
  return (
    <div className="group flex gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <Link to={`/video/${v.id}`} className="relative flex-shrink-0">
        <div className="relative h-[90px] w-[160px] overflow-hidden rounded-md bg-muted sm:h-[100px] sm:w-[180px]">
          <img
            src={v.cover}
            alt={v.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[11px] text-white">
            {v.duration}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <Link to={`/video/${v.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {v.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <img
            src={v.authorAvatar}
            alt={v.author}
            className="size-5 rounded-full"
          />
          <span>{v.author}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Play className="size-3" />
            {formatNumber(v.views)}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="size-3" />
            {v.date}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── page ─── */
export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()

  const currentCategory = useMemo(
    () => categories.find((c) => c.slug === slug) ?? categories[0],
    [slug]
  )

  const [activeSub, setActiveSub] = useState(currentCategory.subs[0])
  const [sortBy, setSortBy] = useState<typeof sortOptions[number]['value']>('newest')

  /* reset sub-tab when category changes */
  useMemo(() => {
    setActiveSub(currentCategory.subs[0])
  }, [currentCategory])

  /* filter + sort videos */
  const videos = useMemo(() => {
    let list = mockVideos.filter(
      (v) => v.category === currentCategory.slug && v.subCategory === activeSub
    )
    switch (sortBy) {
      case 'newest':
        list = list.sort((a, b) => +new Date(b.date) - +new Date(a.date))
        break
      case 'hottest':
        list = list.sort((a, b) => b.views - a.views)
        break
      case 'most-played':
        list = list.sort((a, b) => b.views - a.views)
        break
    }
    return list
  }, [currentCategory, activeSub, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* ── category nav ── */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                cat.slug === currentCategory.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* ── sub-category tabs ── */}
        <div className="mb-4 border-b">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-1 pb-0">
              {currentCategory.subs.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSub(sub)}
                  className={`relative border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeSub === sub
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* ── sort bar ── */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Filter className="mr-1 size-4 text-muted-foreground" />
            {sortOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={sortBy === opt.value ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1 text-xs"
                onClick={() => setSortBy(opt.value)}
              >
                <opt.icon className="size-3.5" />
                {opt.label}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            共 {videos.length} 个视频
          </span>
        </div>

        {/* ── video list ── */}
        <div className="space-y-3">
          {videos.length > 0 ? (
            videos.map((v) => <VideoListItem key={v.id} v={v} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Play className="mb-3 size-12 opacity-30" />
              <p className="text-sm">该分类下暂无视频</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
