import { tagService } from '../../services/dashboard/TagService';
import { UserTag } from '../../types/dataAbstraction';

export function TagCloud() {
  const tags = tagService.getAllTags();
  const topTags = tags
    .filter(tag => tag.resultCount > 0)
    .sort((a, b) => b.resultCount - a.resultCount)
    .slice(0, 20);

  if (topTags.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">🏷️ 标签云</h3>
        <p className="text-slate-500 text-center py-8">暂无标签数据</p>
      </div>
    );
  }

  const maxCount = Math.max(...topTags.map(t => t.resultCount));
  const minCount = Math.min(...topTags.map(t => t.resultCount));

  const getFontSize = (count: number): string => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    const minSize = 0.875;
    const maxSize = 1.5;
    const size = minSize + ratio * (maxSize - minSize);
    return `${size}rem`;
  };

  const getOpacity = (count: number): string => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    return String(0.6 + ratio * 0.4);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">🏷️ 标签云</h3>
        <span className="text-sm text-slate-500">{topTags.length} 个标签</span>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {topTags.map(tag => (
          <div
            key={tag.id}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${tag.color} transition-transform hover:scale-105 cursor-pointer`}
            style={{
              fontSize: getFontSize(tag.resultCount),
              opacity: getOpacity(tag.resultCount),
            }}
            title={`${tag.name}: ${tag.resultCount}次`}
          >
            {tag.icon && <span>{tag.icon}</span>}
            <span className="font-medium">{tag.name}</span>
            <span className="text-xs opacity-75">({tag.resultCount})</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>出现次数</span>
          <div className="flex space-x-4">
            <span>少</span>
            <div className="w-24 h-2 bg-gradient-to-r from-slate-200 to-slate-500 rounded-full"></div>
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TagBadgeProps {
  tag: UserTag;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  onRemove?: () => void;
}

export function TagBadge({ tag, size = 'md', showCount = true, onRemove }: TagBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 rounded-full ${tag.color} ${sizeClasses[size]} transition-transform hover:scale-105`}
    >
      {tag.icon && <span>{tag.icon}</span>}
      <span className="font-medium">{tag.name}</span>
      {showCount && tag.resultCount > 0 && <span className="opacity-75">({tag.resultCount})</span>}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:bg-black/10 rounded-full p-0.5">
          ×
        </button>
      )}
    </div>
  );
}
