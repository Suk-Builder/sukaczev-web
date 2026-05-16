import { useState, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { ThumbsUp, MessageCircle, ChevronDown, Send } from 'lucide-react';

// ============ Types ============
export interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  replies: number;
  time: string;
  liked?: boolean;
  replyList?: ReplyItem[];
}

export interface ReplyItem {
  id: string;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  time: string;
  toUser?: string;
}

interface CommentSectionProps {
  comments?: CommentItem[];
}

// ============ Mock Data ============
export const mockComments: CommentItem[] = [
  {
    id: 'c1',
    user: '用户A',
    avatar: 'https://picsum.photos/40/40?random=a',
    content: '太强了！6小时完成整个平台，这速度简直不可思议。请问能分享一下数据库设计吗？',
    likes: 234,
    replies: 3,
    time: '2小时前',
    replyList: [
      {
        id: 'r1',
        user: 'SUK_白桦',
        avatar: 'https://picsum.photos/40/40?random=ymm',
        content: '谢谢支持！数据库设计图我放在视频简介里了，可以自取~',
        likes: 45,
        time: '1小时前',
      },
      {
        id: 'r2',
        user: '用户C',
        avatar: 'https://picsum.photos/40/40?random=c',
        content: '感谢UP主！',
        likes: 3,
        time: '30分钟前',
        toUser: 'SUK_白桦',
      },
    ],
  },
  {
    id: 'c2',
    user: '用户B',
    avatar: 'https://picsum.photos/40/40?random=b',
    content: '6小时完成？我不信，除非你把计时器放出来（狗头）',
    likes: 56,
    replies: 2,
    time: '1小时前',
    replyList: [
      {
        id: 'r3',
        user: '用户D',
        avatar: 'https://picsum.photos/40/40?random=d',
        content: '你可以看直播回放，确实有6小时',
        likes: 12,
        time: '45分钟前',
      },
    ],
  },
  {
    id: 'c3',
    user: '前端小王子',
    avatar: 'https://picsum.photos/40/40?random=e',
    content: '这个弹幕系统实现得好精致，Canvas绘制比DOM性能好太多了。能出一期讲解视频吗？',
    likes: 89,
    replies: 1,
    time: '3小时前',
  },
  {
    id: 'c4',
    user: '全栈工程师',
    avatar: 'https://picsum.photos/40/40?random=f',
    content: '整体架构很清晰，React + Node.js + PostgreSQL，经典组合。不过我觉得缓存层可以加个Redis会更完善。',
    likes: 156,
    replies: 4,
    time: '4小时前',
    replyList: [
      {
        id: 'r4',
        user: 'SUK_白桦',
        avatar: 'https://picsum.photos/40/40?random=ymm',
        content: '你说得对！Redis确实在计划中了，下个版本会上线缓存优化。',
        likes: 23,
        time: '3小时前',
      },
      {
        id: 'r5',
        user: '后端老鸟',
        avatar: 'https://picsum.photos/40/40?random=g',
        content: 'Redis用Cluster模式还是Sentinel？推荐Cluster，扩展性好。',
        likes: 8,
        time: '2小时前',
        toUser: 'SUK_白桦',
      },
    ],
  },
  {
    id: 'c5',
    user: '大学生程序员',
    avatar: 'https://picsum.photos/40/40?random=h',
    content: '作为初学者，这个视频对我帮助很大。跟着做了一遍，虽然花了两天但是学到了很多！',
    likes: 67,
    replies: 0,
    time: '5小时前',
  },
  {
    id: 'c6',
    user: '设计师小美',
    avatar: 'https://picsum.photos/40/40?random=i',
    content: 'UI设计好好看，那个粉粉的主题色太可爱了，可以求一份Figma文件吗？',
    likes: 34,
    replies: 1,
    time: '6小时前',
  },
  {
    id: 'c7',
    user: 'CTO老王',
    avatar: 'https://picsum.photos/40/40?random=j',
    content: '代码质量很高，TypeScript类型定义很规范，ESLint配置也很专业。已转发给团队学习。',
    likes: 312,
    replies: 5,
    time: '8小时前',
  },
];

// ============ Components ============

function ReplyCard({ reply }: { reply: ReplyItem }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reply.likes);

  const handleLike = useCallback(() => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  return (
    <div className="flex gap-2 py-2">
      <img
        src={reply.avatar}
        alt={reply.user}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[#CD5700] font-medium">{reply.user}</span>
          {reply.toUser && (
            <>
              <span className="text-gray-400">回复</span>
              <span className="text-[#CD5700]">@{reply.toUser}</span>
            </>
          )}
          <span className="text-gray-400 ml-1">{reply.time}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{reply.content}</p>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 mt-1 text-xs transition-colors ${
            liked ? 'text-[#CD5700]' : 'text-gray-400 hover:text-[#CD5700]'
          }`}
        >
          <ThumbsUp className="w-3 h-3" />
          {likeCount}
        </button>
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: CommentItem }) {
  const [liked, setLiked] = useState(comment.liked ?? false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyList, setReplyList] = useState<ReplyItem[]>(comment.replyList ?? []);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleLike = useCallback(() => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleReply = useCallback(() => {
    if (!replyText.trim()) return;
    const newReply: ReplyItem = {
      id: `r-${Date.now()}`,
      user: '我',
      avatar: 'https://picsum.photos/40/40?random=me',
      content: replyText.trim(),
      likes: 0,
      time: '刚刚',
      toUser: comment.user,
    };
    setReplyList((prev) => [...prev, newReply]);
    setReplyText('');
    setShowReplyInput(false);
    setShowReplies(true);
  }, [replyText, comment.user]);

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <img
        src={comment.avatar}
        alt={comment.user}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#CD5700]">{comment.user}</span>
          <span className="text-xs text-gray-400">{comment.time}</span>
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">{comment.content}</p>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${
              liked ? 'text-[#CD5700]' : 'text-gray-400 hover:text-[#CD5700]'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            {likeCount}
          </button>
          <button
            onClick={() => setShowReplyInput((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#CD5700] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            回复
          </button>
        </div>

        {showReplyInput && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && handleReply()}
              placeholder={`回复 @${comment.user}...`}
              autoFocus
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#CD5700] dark:text-white"
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="bg-[#CD5700] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#fb5b85] transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {replyList.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 text-xs text-[#CD5700] hover:underline mb-1"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-180' : ''}`}
              />
              {showReplies ? '收起' : `展开 ${replyList.length} 条回复`}
            </button>
            {showReplies && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 divide-y divide-gray-100 dark:divide-gray-700">
                {replyList.map((reply) => (
                  <ReplyCard key={reply.id} reply={reply} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ comments = mockComments }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState<CommentItem[]>(comments);

  const handlePostComment = useCallback(() => {
    if (!commentText.trim()) return;
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      user: '我',
      avatar: 'https://picsum.photos/40/40?random=me',
      content: commentText.trim(),
      likes: 0,
      replies: 0,
      time: '刚刚',
    };
    setCommentList((prev) => [newComment, ...prev]);
    setCommentText('');
  }, [commentText]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        评论
        <span className="text-sm font-normal text-gray-400">{commentList.length}</span>
      </h3>

      <div className="flex gap-3 mb-6">
        <img
          src="https://picsum.photos/40/40?random=me"
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && handlePostComment()}
              placeholder="发条友善的评论吧~"
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#CD5700] dark:text-white transition-colors"
            />
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim()}
              className="bg-[#CD5700] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#fb5b85] transition-colors disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {commentList.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>

      {commentList.length === 0 && (
        <div className="text-center text-gray-400 py-12">暂无评论，快来抢沙发吧~</div>
      )}
    </div>
  );
}
