import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, BookOpen, ShoppingBag, FolderTree } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  parentId: string | null;
  parentName?: string;
  type: 'book' | 'universal';
  isSubcategory: boolean;
}

interface DynamicCategorySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  includeUniversal?: boolean;
  mode?: 'all' | 'parents_only' | 'subcategories_only';
}

export const DynamicCategorySelector = ({
  selectedIds = [],
  onChange,
  includeUniversal = true,
  mode = 'all',
}: DynamicCategorySelectorProps) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'parent' | 'sub' | 'universal'>('all');

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: bookCats }, { data: uniCats }] = await Promise.all([
        supabase.from('categories').select('id, name_bn, parent_id, sort_order').eq('is_active', true).order('sort_order'),
        supabase.from('universal_categories').select('id, name_bn, product_type, parent_id').eq('is_active', true).order('name_bn'),
      ]);

      const rawBooks = bookCats || [];
      const bookParentMap = new Map<string, string>();
      rawBooks.forEach((c: any) => {
        if (!c.parent_id) bookParentMap.set(c.id, c.name_bn);
      });

      const items: CategoryItem[] = [
        ...rawBooks.map((c: any) => ({
          id: c.id,
          name: c.name_bn,
          parentId: c.parent_id || null,
          parentName: c.parent_id ? bookParentMap.get(c.parent_id) : undefined,
          type: 'book' as const,
          isSubcategory: Boolean(c.parent_id),
        })),
        ...(includeUniversal
          ? (uniCats || []).map((c: any) => ({
              id: c.id,
              name: `${c.name_bn} (${c.product_type})`,
              parentId: c.parent_id || null,
              type: 'universal' as const,
              isSubcategory: Boolean(c.parent_id),
            }))
          : []),
      ];

      setCategories(items);
      setLoading(false);
    };
    fetchAll();
  }, [includeUniversal]);

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      if (mode === 'parents_only' && c.isSubcategory) return false;
      if (mode === 'subcategories_only' && !c.isSubcategory) return false;

      if (filterTab === 'parent' && (c.isSubcategory || c.type !== 'book')) return false;
      if (filterTab === 'sub' && !c.isSubcategory) return false;
      if (filterTab === 'universal' && c.type !== 'universal') return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.parentName && c.parentName.toLowerCase().includes(q))
      );
    });
  }, [categories, search, filterTab, mode]);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const selectAllVisible = () => {
    const visibleIds = filtered.map((c) => c.id);
    const merged = Array.from(new Set([...selectedIds, ...visibleIds]));
    onChange(merged);
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedCategories = categories.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-2.5">
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/40 rounded-lg border border-border/60">
          {selectedCategories.map((c) => (
            <Badge key={c.id} variant="secondary" className="gap-1 text-xs py-0.5">
              {c.type === 'book' ? (
                c.isSubcategory ? (
                  <FolderTree className="w-3 h-3 text-emerald-600" />
                ) : (
                  <BookOpen className="w-3 h-3 text-primary" />
                )
              ) : (
                <ShoppingBag className="w-3 h-3 text-orange-500" />
              )}
              <span>
                {c.parentName ? `${c.parentName} ➔ ` : ''}
                {c.name.slice(0, 28)}
              </span>
              <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => toggle(c.id)} />
            </Badge>
          ))}
        </div>
      )}

      {mode === 'all' && (
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap gap-1">
            {[
              { key: 'all', label: 'সব ডাটাবেস ক্যাটাগরি' },
              { key: 'parent', label: 'মূল ক্যাটাগরি' },
              { key: 'sub', label: 'সাব-ক্যাটাগরি' },
              ...(includeUniversal ? [{ key: 'universal', label: 'ইউনিভার্সাল' }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key as any)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-primary hover:underline font-medium"
            >
              সব সিলেক্ট
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-destructive hover:underline font-medium"
              >
                রিসেট
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ডাটাবেস থেকে ক্যাটাগরি বা সাব-ক্যাটাগরি খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <ScrollArea className="h-56 border rounded-md bg-background">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">ডাটাবেস থেকে ক্যাটাগরি লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">কোনো ক্যাটাগরি পাওয়া যায়নি</div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {filtered.map((c) => (
              <label
                key={c.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-muted cursor-pointer text-sm ${
                  c.isSubcategory ? 'pl-6 text-muted-foreground' : 'font-medium text-foreground'
                }`}
              >
                <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
                {c.type === 'book' ? (
                  c.isSubcategory ? (
                    <FolderTree className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                  )
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                )}
                <span className="truncate flex-1">
                  {c.parentName ? (
                    <span className="text-xs text-muted-foreground">{c.parentName} ➔ </span>
                  ) : null}
                  <span className="text-foreground">{c.name}</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                  {c.type === 'universal' ? 'ইউনিভার্সাল' : c.isSubcategory ? 'সাব-ক্যাটাগরি' : 'মূল ক্যাটাগরি'}
                </span>
              </label>
            ))}
          </div>
        )}
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        মোট {categories.length} টি ডাটাবেস ক্যাটাগরির মধ্যে {selectedIds.length} টি নির্বাচিত (খালি রাখলে সব সক্রিয় ক্যাটাগরি দেখাবে)
      </p>
    </div>
  );
};
