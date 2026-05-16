import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Play,
  Clock,
  X,
  TrendingUp,
  Clock3,
  Filter,
  Flame,
} from 'lucide-react'

/* ─── types ─── */
interface SearchVideo {
  id: string
  title: string
  cover: string
  views: number
  duration: string
  date: string
  author: string
  authorAvatar: string
  category: string
  desc: string
}

/* ─── mock data ─── */
const hotSearch = [
  '6小时挑战',
  '裂缝递砖建造者',
  '双相情感障碍',
  'MyGO分析',
  'BDI测评',
  'Sukačev',
]

const allVideos: SearchVideo[] = [
  { id: 's1', title: '6小时极限挑战：从零搭建React组件库', cover: 'https://picsum.photos/320/180?random=31', views: 12400, duration: '12:34', date: '2024-01-15', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: '编程', desc: '6小时不间断编程挑战，从零开始搭建一套完整的React组件库，包含按钮、输入框、对话框等20+组件。' },
  { id: 's2', title: '裂缝递砖建造者：BDI 150+ 的人生指南', cover: 'https://picsum.photos/320/180?random=32', views: 35600, duration: '18:22', date: '2024-02-03', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: '知识', desc: '关于裂缝递砖建造者的深度解读，分享作者在B D I 150+状态下的心路历程和自我疗愈方法。' },
  { id: 's3', title: '双相情感障碍：认识情绪的跷跷板', cover: 'https://picsum.photos/320/180?random=33', views: 44500, duration: '14:22', date: '2024-03-10', author: '心理科普', authorAvatar: 'https://picsum.photos/40/40?random=p', category: '科普', desc: '双相情感障碍不是性格缺陷，而是一种需要被理解的精神疾病。本期视频带你深入了解这种情绪跷跷板。' },
  { id: 's4', title: 'MyGO!!!!! 剧情深度解析与角色心理剖析', cover: 'https://picsum.photos/320/180?random=34', views: 56700, duration: '28:15', date: '2024-03-12', author: '番剧解析', authorAvatar: 'https://picsum.photos/40/40?random=i', category: '动画', desc: '从心理学角度深度解析MyGO!!!!!中每个角色的行为动机，理解少女们呐喊背后的深层含义。' },
  { id: 's5', title: 'BDI 贝克抑郁量表在线测评指南', cover: 'https://picsum.photos/320/180?random=35', views: 89200, duration: '08:45', date: '2024-04-01', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: '科普', desc: '详细讲解BDI贝克抑郁量表的使用方法、评分标准和注意事项，帮助更多人了解自己的心理状态。' },
  { id: 's6', title: 'Sukačev 架构设计：高并发视频平台技术选型', cover: 'https://picsum.photos/320/180?random=36', views: 23100, duration: '22:18', date: '2024-04-20', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: '编程', desc: 'Sukačev平台的技术架构深度解析，包括微服务拆分、缓存策略、CDN加速和数据库选型。' },
  { id: 's7', title: '农民的儿子：从山村到全栈开发者的十年', cover: 'https://picsum.photos/320/180?random=37', views: 67800, duration: '15:50', date: '2024-04-01', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: '生活', desc: '一个来自山村的孩子，如何用十年时间成长为全栈开发者。关于出身、努力与选择的真实故事。' },
  { id: 's8', title: '21岁全栈开发者的学习路线图', cover: 'https://picsum.photos/320/180?random=38', views: 156000, duration: '32:00', date: '2024-05-01', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: '编程', desc: '前端React、后端Node.js、数据库PostgreSQL、部署Docker——一条完整的全栈学习路线。' },
  { id: 's9', title: '6小时学会TypeScript：从入门到实战', cover: 'https://picsum.photos/320/180?random=39', views: 98700, duration: '6:00:00', date: '2024-05-10', author: 'CodeMaster', authorAvatar: 'https://picsum.photos/40/40?random=g', category: '编程', desc: '6小时超长TypeScript实战教程，从基础类型到高级泛型，从配置到项目实战，一次学会。' },
  { id: 's10', title: 'Sukačev平台前端性能优化实践', cover: 'https://picsum.photos/320/180?random=40', views: 18900, duration: '19:30', date: '2024-05-15', author: 'SUK_白桦', authorAvatar: 'https://picsum.photos/40/40?random=a', category: '编程', desc: '从代码分割、懒加载、虚拟列表到缓存策略，全面分享Sukačev平台的前端性能优化经验。' },
]

const filterCategories = ['全部', '动画', '音乐', '科技', '知识', '生活', '游戏', '编程', '科普']
const filterDuration = ['全部', '10分钟以下', '10-30分钟', '30-60分钟', '60分钟以上']
const filterTime = ['全部时间', '一天内', '一周内', '一月内', '一年内']

/* ─── helpers ─── */
function formatNumber(n: number) {
  if (n >= 100000) return (n / 10000).toFixed(0) + '万'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

function highlightKeyword(text: string, keyword: string) {
  if (!keyword.trim()) return text
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="rounded bg-primary/15 px-0.5 text-foreground">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

/* ─── video card ─── */
function VideoCard({ v, keyword }: { v: SearchVideo; keyword: string }) {
  return (
    <div className="group flex gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <Link to={`/video/${v.id}`} className="relative flex-shrink-0">
        <div className="relative h-[90px] w-[160px] overflow-hidden rounded-md bg-muted sm:h-[110px] sm:w-[200px]">
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
            {highlightKeyword(v.title, keyword)}
          </h3>
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {highlightKeyword(v.desc, keyword)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <img src={v.authorAvatar} alt={v.author} className="size-5 rounded-full" />
          <span className="text-foreground">{v.author}</span>
          <span>·</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{v.category}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Play className="size-3" />
            {formatNumber(v.views)}
          </span>
          <span>·</span>
          <span>{v.date}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── page ─── */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQ)
  const [inputValue, setInputValue] = useState(initialQ)

  /* filters */
  const [catFilter, setCatFilter] = useState('全部')
  const [durFilter, setDurFilter] = useState('全部')
  const [timeFilter, setTimeFilter] = useState('全部时间')

  /* perform search */
  const handleSearch = () => {
    setQuery(inputValue.trim())
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() })
    } else {
      setSearchParams({})
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleHotClick = (term: string) => {
    setInputValue(term)
    setQuery(term)
    setSearchParams({ q: term })
  }

  const clearSearch = () => {
    setInputValue('')
    setQuery('')
    setSearchParams({})
  }

  /* filtered results */
  const results = useMemo(() => {
    let list = allVideos

    if (query) {
      const q = query.toLowerCase()
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.desc.toLowerCase().includes(q) ||
          v.author.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      )
    }

    if (catFilter !== '全部') {
      list = list.filter((v) => v.category === catFilter)
    }

    if (durFilter !== '全部') {
      list = list.filter((v) => {
        const [h, m] = v.duration.split(':').map(Number)
        const totalMin = h * 60 + m
        switch (durFilter) {
          case '10分钟以下': return totalMin < 10
          case '10-30分钟': return totalMin >= 10 && totalMin < 30
          case '30-60分钟': return totalMin >= 30 && totalMin < 60
          case '60分钟以上': return totalMin >= 60
          default: return true
        }
      })
    }

    if (timeFilter !== '全部时间') {
      const now = new Date()
      list = list.filter((v) => {
        const d = new Date(v.date)
        switch (timeFilter) {
          case '一天内': return (+now - +d) / 86400000 < 1
          case '一周内': return (+now - +d) / 86400000 < 7
          case '一月内': return (+now - +d) / 86400000 < 30
          case '一年内': return (+now - +d) / 86400000 < 365
          default: return true
        }
      })
    }

    return list
  }, [query, catFilter, durFilter, timeFilter])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* ── big search bar ── */}
        <div className="mb-8 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索视频、UP主、番剧..."
              className="h-12 rounded-lg pl-10 pr-10 text-base"
            />
            {inputValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button size="lg" className="h-12 px-6" onClick={handleSearch}>
            <Search className="mr-1.5 size-4" />
            搜索
          </Button>
        </div>

        {/* ── hot search ── */}
        {!query && (
          <div className="mb-8 rounded-lg border p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Flame className="size-4 text-primary" />
              热搜榜
            </h2>
            <div className="flex flex-wrap gap-2">
              {hotSearch.map((term, idx) => (
                <button
                  key={term}
                  onClick={() => handleHotClick(term)}
                  className="group flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded text-[11px] font-bold ${
                      idx < 3
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── main content ── */}
        <div className="flex gap-6">
          {/* ── left: filters ── */}
          <aside className="hidden w-48 flex-shrink-0 lg:block">
            <div className="space-y-6">
              {/* category filter */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Filter className="size-3.5" />
                  分类筛选
                </h3>
                <div className="space-y-0.5">
                  {filterCategories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCatFilter(c)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                        catFilter === c
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {c}
                      {catFilter === c && <span className="text-primary">·</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* duration filter */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  时长
                </h3>
                <div className="space-y-0.5">
                  {filterDuration.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDurFilter(d)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                        durFilter === d
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* time filter */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  上传时间
                </h3>
                <div className="space-y-0.5">
                  {filterTime.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                        timeFilter === t
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── right: results ── */}
          <div className="flex-1">
            {/* result count */}
            {query && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  &quot;<span className="font-medium text-foreground">{query}</span>&quot;
                  的搜索结果（{results.length}个）
                </p>
              </div>
            )}

            {/* filter tags (mobile) */}
            <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                {filterCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={durFilter}
                onChange={(e) => setDurFilter(e.target.value)}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                {filterDuration.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                {filterTime.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* results list */}
            <div className="space-y-3">
              {results.length > 0 ? (
                results.map((v) => (
                  <VideoCard key={v.id} v={v} keyword={query} />
                ))
              ) : query ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Search className="mb-3 size-12 opacity-30" />
                  <p className="text-sm">未找到与 &quot;{query}&quot; 相关的视频</p>
                  <p className="mt-1 text-xs">换个关键词试试吧</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Search className="mb-3 size-12 opacity-30" />
                  <p className="text-sm">输入关键词开始搜索</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
