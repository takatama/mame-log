import React, { useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { isFixedOption, isDynamicOption } from '../types/Settings';
import FixedOptionEditor from '../components/FixedOptionEditor';
import DynamicOptionEditor from '../components/DynamicOptionEditor';
import { signOut } from '@hono/auth-js/react';
import TagEditor from '../components/TagEditor';
import { Tag } from '../types/Tag';
import { useCoffeeContext } from '../context/CoffeeContext';

interface BulkResponse {
  tags: { id: number; name: string }[];
}

const Settings: React.FC = () => {
  const { settings, updateSettings, saveSettings, loadSettings } = useSettingsContext();
  const { tags, setTags } = useCoffeeContext();
  const [previewCups, setPreviewCups] = useState<number>(1);
  const [initialTags, setInitialTags] = useState<Tag[]>(tags);
  const [currentTags, setCurrentTags] = useState<Tag[]>(initialTags);

  const sanitizeTags = (currentTags: Tag[], initialTags: Tag[]): Tag[] => {
    const initialTagMap = new Map(
      initialTags.map((tag) => [tag.name.trim(), tag.id])
    );
    const seenNames = new Set<string>();
    const sanitized: Tag[] = [];
  
    for (const tag of currentTags) {
      const trimmedName = tag.name.trim();
  
      if (!trimmedName) {
        // 空の名前のタグはスキップ
        continue;
      }
  
      if (!seenNames.has(trimmedName)) {
        seenNames.add(trimmedName); // 名前を追跡
        sanitized.push({
          ...tag,
          name: trimmedName,
          id: tag.id ?? initialTagMap.get(trimmedName) ?? undefined, // ID を再利用または設定
        });
      }
    }
  
    return [...sanitized];
  };
  
  const handleSave = async () => {
    const sanitizedSettings = Object.entries(settings).reduce((acc, [key, setting]) => {
      acc[key] = {
        ...setting,
        ...(isFixedOption(setting) && {
          fixedOptions: setting.fixedOptions
            ?.flatMap((option) => {
              if (typeof option !== 'string') return option;
              const trimmed = option.trim();
              return trimmed ? trimmed : [];
            }) as (string | number)[] || undefined,
        }),
      };
      return acc;
    }, {} as typeof settings);

    await saveSettings(sanitizedSettings);

    const sanitizedTags = sanitizeTags(currentTags, initialTags);

    const addedTags = sanitizedTags.filter(
      (tag) => !tag.id && !initialTags.some((prev) => prev.name === tag.name)
    );    

    const updatedTags = sanitizedTags.filter(
      (tag) =>
        tag.id &&
        initialTags.some((prev) => prev.id === tag.id && prev.name !== tag.name)
    );

    const removedTags = initialTags.filter(
      (prev) => !sanitizedTags.some((tag) => tag.id === prev.id)
    );

    console.log('sanitizedTags', sanitizedTags);
    console.log('Added Tags:', addedTags);
    console.log('Updated Tags:', updatedTags);
    console.log('Removed Tags:', removedTags);

    const tags = {
      addedTags, updatedTags, removedTagIds: removedTags.map(tag => tag.id)
    };

    try {
      const response = await fetch('/api/users/tags/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tags),
      });
      if (!response.ok) {
        throw new Error(`Failed to save tags: ${response.statusText}`);
      }

      const { tags: updatedTags } = (await response.json()) as BulkResponse;
    
      // 状態を更新
      setTags(updatedTags)
      setInitialTags(updatedTags);
      setCurrentTags(updatedTags);

    } catch(error) {
      console.error(error);
      alert('タグの保存中にエラーが発生しました。再試行してください。');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => signOut()}
        className="px-4 py-2 border flex gap-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150"
      >
        サインアウト
      </button>
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <h1 className="text-2xl font-bold mt-4 mb-4">設定を変更</h1>
        <div key="tag" className="mb-6 border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">タグ</h2>
          <TagEditor
            tags={currentTags}
            onTagsChange={setCurrentTags}
          />
        </div>
        {Object.entries(settings).map(([key, setting]) => (
          <div key={key} className="mb-6 border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{setting.displayName} {setting.unitLabel ? `[${setting.unitLabel}]` : ""}</h2>
            {isFixedOption(setting) && (
              <FixedOptionEditor
                setting={setting}
                onChange={(newSetting) => updateSettings(key, newSetting)}
              />
            )}
            {isDynamicOption(setting) && (
              <DynamicOptionEditor
                key={key}
                setting={setting}
                onChange={(newSetting) => updateSettings(key, newSetting)}
                previewCups={previewCups}
              />
            )}
          </div>
        ))}
        <div className="mb-6 border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">プレビューのカップ数</h2>
          <input
            type="number"
            min="1"
            value={previewCups}
            onChange={(e) => setPreviewCups(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          設定を保存する
        </button>
        <button
          type="button"
          onClick={loadSettings}
          className="bg-gray-500 text-white p-2 rounded-md ml-2"
        >
          設定を読み込む
        </button>
      </form>
    </div>
  );
};

export default Settings;