import React, { useEffect } from 'react';
import { useBrewContext } from '../context/BrewContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Bean } from '../types/Bean';
import { Brew } from '../types/Brew';
import { BrewListItem } from './BrewList';
import TagList from '../components/TagList';

const BeanDetail: React.FC = () => {
  const { beans, setBeans, brews } = useBrewContext();
  const [ relatedBrews, setRelatedBrews ] = React.useState<Brew[]>([]);
  const { beanId } = useParams<{ beanId?: string }>()
  const [ bean, setBean ] = React.useState<Bean | undefined>(undefined)
  const navigate = useNavigate();

  useEffect(() => {
    if (!beanId) return;
    const bean = beans.find((bean) => bean.id === Number(beanId));
    setBean(bean);
    setRelatedBrews(brews.filter(brew => brew.bean_id?.toString() === beanId))
  }, [beanId, beans]);

  const handleDelete = async () => {
    if (!beanId) return;

    const confirmed = window.confirm('本当に削除しますか？ (関連する抽出ログもすべて削除します)');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/beans/${beanId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete bean: ${response.statusText}`);
      }

      // 成功時に状態を更新し、リストページにリダイレクト
      setBeans(beans.filter((bean) => bean.id !== Number(beanId)));
      navigate('/beans');
    } catch (error) {
      console.error(error);
      alert('削除に失敗しました。再試行してください。');
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/beans?tag=${encodeURIComponent(tag)}`); // タグでフィルタした豆一覧を表示
  };

  if (!bean) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{bean.name}</h1>
      <TagList tags={bean.tags || []} onTagClick={handleTagClick} />
      {(bean.photo_data_url || bean.photo_url) && (
        <img
          src={bean.photo_data_url || bean.photo_url}
          alt={bean.name}
          className="mt-4 mb-4 w-32 h-32 object-cover"
        />
      )}
      {bean.country && (<p>
        <strong>国:</strong> {bean.country}
      </p>)}
      {bean.area && (<p>
        <strong>地域:</strong> {bean.area}
      </p>)}
      {bean.drying_method && (<p>
        <strong>乾燥方法:</strong> {bean.drying_method}
      </p>)}
      {bean.processing_method && (<p>
        <strong>精製方法:</strong> {bean.processing_method}
      </p>)}
      {bean.roast_level && (<p>
        <strong>焙煎度:</strong> {bean.roast_level}
      </p>)}
      {bean.notes && (<p>
        <strong>メモ:</strong> {bean.notes}
      </p>)}
      <h3 className="text-xl font-bold mt-4 mb-2">抽出ログ</h3>
      <ul className="space-y-4 mt-4">
        {relatedBrews.length > 0 ? (relatedBrews.map((brew) => (
          <BrewListItem key={brew.id} brew={brew} />
        ))): <div>なし</div>}
      </ul>
      <div className="mt-4 py-2">
        <Link
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          to={`/beans/${beanId}/brews/new`}>
          新しく淹れる
        </Link>
      </div>
      <div className="mt-4 py-2">
        <Link
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          to={`/beans/${beanId}/edit`}>
          編集する
        </Link>
      </div>
      {beanId && (
        <div className="mt-4 py-2">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
          >
            削除する
          </button>
        </div>
      )}
    </div>
  )
};

export default BeanDetail;
