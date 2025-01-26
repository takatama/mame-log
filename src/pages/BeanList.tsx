import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCoffeeContext } from '../context/CoffeeContext';
import { Bean } from '../types/Bean';
import TagList from '../components/TagList';

interface BeanListItemProps {
  bean: Bean;
}

const BeanListItem: React.FC<BeanListItemProps> = ({ bean }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/beans?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <li key={bean.id} className="p-4 border rounded-md flex items-center">
        {(bean.photo_data_url || bean.photo_url) && (
        <img
          src={bean.photo_data_url || bean.photo_url}
          alt={bean.name}
          className="w-16 h-16 object-cover rounded-full mr-4"
        />
      )}
      <div>
        <Link to={`/beans/${bean.id}`} className="text-blue-500 hover:underline">
          <h2 className="font-bold">{bean.name}</h2>
        </Link>
        <div className="my-2">
          <TagList tags={bean.tags || []} onTagClick={handleTagClick} />
        </div>
        {bean.country && (<p>
          {bean.country} ({bean.area})
        </p>)}
        {bean.roast_level && (<p>{bean.roast_level}</p>)}
      </div>
    </li>
  );
}

const BeanList: React.FC = () => {
  const { beans } = useCoffeeContext();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">コーヒー豆一覧</h1>
      <ul className="space-y-4">
        {beans.map((bean) => (
          <BeanListItem key={bean.id} bean={bean} />
        ))}
      </ul>
      <div className="mt-4 py-4">
        <Link
          to="/beans/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          豆を追加する
        </Link>
      </div>
    </div>
  );
};

export default BeanList;
