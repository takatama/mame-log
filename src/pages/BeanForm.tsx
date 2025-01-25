import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBrewContext } from '../context/BrewContext';
import { Bean } from '../types/Bean';
import TagManager from '../components/TagManager';
import { useSettingsContext } from '../context/SettingsContext';

const BeanForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { beans, updateBean, setBeans } = useBrewContext();
  const { beanId } = useParams();
  const { tags, setTags } = useSettingsContext();
  const [bean, setBean] = useState<Bean>({
    name: '',
    country: '',
    area: '',
    drying_method: '',
    processing_method: '',
    roast_level: '',
    photo_url: '',
    notes: '',
    tags: [],
    tagIds: [],
  });

  const getBeanById = (beanId: number) => beans.find((bean) => bean.id === beanId);

  useEffect(() => {
    if (location.state?.bean) {
      setBean(location.state.bean as Bean);
    } else if (beanId) {
      const existingBean = getBeanById(Number(beanId));
      if (existingBean) setBean(existingBean);
    }
  }, [beanId, location.state]);

  const tagSuggestions = tags.map((tag) => tag.name);

  // 新しいタグをIDで追加
  const handleAddTag = (tagName: string) => {
    const existingTag = tags.find((tag) => tag.name === tagName);
    if (existingTag) {
      // 既存のタグを追加
      setBean((prev) => ({
        ...prev,
        tagIds: [...new Set([...(prev.tagIds || []), existingTag.id!])],
      }));
    } else {
      // 新しいタグを作成
      const newTag = { id: undefined, name: tagName };
      setTags((prevTags) => [...prevTags, newTag]);
      setBean((prev) => ({
        ...prev,
        tagIds: [...new Set([...(prev.tagIds || []), undefined])],
      }));
    }
  };

  // タグIDを削除
  const handleRemoveTag = (tagName: string) => {
    const tagToRemove = tags.find((tag) => tag.name === tagName);
    if (tagToRemove) {
      setBean((prev) => ({
        ...prev,
        tagIds: prev.tagIds?.filter((id) => id !== tagToRemove.id),
      }));
    }
  };

  const handlePost = async (newBean: Bean) => {
    try {
      const response = await fetch('/api/users/beans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBean),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create bean: ${response.statusText}`);
      }
  
      const createdBean: Bean = await response.json();
      // KVに保存した画像が取得できるようになるまで時間がかかるため、ローカルの写真があれば表示する。
      createdBean.photo_data_url = newBean.photo_data_url || '';
      // 作成されたIDで更新
      setBeans([...beans, createdBean]);
      navigate(`/beans/${createdBean.id}`);
      return createdBean;
    } catch (error) {
      console.error(error);
      alert('An error occurred while creating the bean. Please try again.');
    }
  };
  
  const handlePut = async (beanId: number, bean: Bean) => {
    const previousBean = getBeanById(beanId); // 現在の状態を取得
    try {
      updateBean(bean); // 状態を一時的に更新
      navigate(`/beans/${beanId}`);
      const response = await fetch(`/api/users/beans/${beanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bean),
      });
  
      if (!response.ok) {
        if (previousBean) updateBean(previousBean); // エラー時に元の状態を復元
        throw new Error(`Failed to update bean: ${response.statusText}`);
      }
      // TODO 楽観的UIにするため、待たずに返却する
      const updatedBean: Bean = await response.json();
      return updatedBean;
    } catch (error) {
      console.error(error);
      if (previousBean) updateBean(previousBean); // エラー時に元の状態を復元
      alert('An error occurred while updating the bean. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const tempId = Date.now();
    const newBean = {
      ...bean,
      id: beanId ? Number(beanId) : tempId,
    };
  
    try {
      const updatedBean = beanId
        ? await handlePut(Number(beanId), newBean)
        : await handlePost(newBean) as Bean;
      
      if (updatedBean?.tags) {
        // 追加したタグを反映
        setTags((prevTags) => {
          const newTags = updatedBean.tagIds
            .filter((id) => !prevTags.some((tag) => tag.id === id))
            .map((id) => ({ id, name: `Tag ${id}` })); // タグ名はバックエンドで返却されると仮定
          return [...prevTags, ...newTags];
        });
      }
    } catch (error) {
      console.error(error);
      alert('保存中にエラーが発生しました。再試行してください。');
    }
  };  

  const handleNavigateToCapture = () => {
    navigate(`/beans/${beanId || 'new'}/capture`);
  };

  if (!bean) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{beanId ? '豆を編集' : '豆を追加'}</h1>
      {(bean.photo_data_url || bean.photo_url) && (
        <div className="mb-4">
          <img
            src={bean.photo_data_url || bean.photo_url}
            alt={bean.name || 'Bean'}
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}
      <button
          type="button"
          onClick={handleNavigateToCapture}
          className="bg-green-500 text-white py-2 px-4 rounded-md mr-2 mb-4"
        >
          AIでラベルを解析
      </button>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">豆の名前</label>
          <input
            type="text"
            value={bean.name}
            onChange={(e) => setBean({ ...bean, name: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">国</label>
          <input
            type="text"
            value={bean.country}
            onChange={(e) => setBean({ ...bean, country: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">地域</label>
          <input
            type="text"
            value={bean.area}
            onChange={(e) => setBean({ ...bean, area: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">乾燥方法</label>
          <input
            type="text"
            value={bean.drying_method}
            onChange={(e) => setBean({ ...bean, drying_method: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">処理方法</label>
          <input
            type="text"
            value={bean.processing_method}
            onChange={(e) => setBean({ ...bean, processing_method: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">焙煎度</label>
          <input
            type="text"
            value={bean.roast_level}
            onChange={(e) => setBean({ ...bean, roast_level: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            value={bean.notes}
            onChange={(e) => setBean({ ...bean, notes: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <TagManager
          tags={bean.tags || []}
          onAdd={handleAddTag}
          onRemove={handleRemoveTag}
          tagSuggestions={tagSuggestions}
        />
        <button className="bg-blue-500 text-white p-2 rounded-md">保存する</button>
      </form>
    </div>
  );
};

export default BeanForm;
