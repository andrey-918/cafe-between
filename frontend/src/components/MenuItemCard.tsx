import { Link } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';
import { getImageUrl } from '../api';

interface MenuItemCardProps {
  id: number;
  name: string;
  description: string;
  price: string;
  calories?: number;
  image?: string | File;
  variants?: string[];
  popular?: boolean;
  category?: string;
  className?: string;
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  calories,
  image,
  variants,
  popular,
  category,
  className
}: MenuItemCardProps) {
  const getImageSrc = (img: string | File) => {
    if (typeof img === 'string') {
      return getImageUrl(img);
    }
    return URL.createObjectURL(img);
  };

  return (
    <Link to={`/menu/${id}`} className="menu-item-card-link">
      <article className={`menu-item-card ${className || ''}`}>
        {image && (
          <div className="menu-item-card-image">
            <ImageWithFallback
              src={getImageSrc(image)}
              alt={name}
              className="menu-item-card-image-img"
            />
            {popular && (
              <div className="menu-item-card-popular-badge">
                <span>★ Популярное</span>
              </div>
            )}
          </div>
        )}

        <div className="menu-item-card-content">
          <div className="menu-item-card-header">
            <h3 className="menu-item-card-title">{name}</h3>
            <span className="menu-item-card-price">{price} ₽</span>
          </div>

          {category && (
            <div className="menu-item-card-category">
              <span className="menu-item-card-category-badge">{category}</span>
            </div>
          )}

          <p className="menu-item-card-description">
            {description}
          </p>

          <div className="menu-item-card-footer">
            {variants && variants.length > 0 && (
              <div className="menu-item-card-variants">
                {variants.map((variant, index) => (
                  <span key={index} className="menu-item-card-variant">{variant}</span>
                ))}
              </div>
            )}

            {calories && (
              <div className="menu-item-card-calories">
                {calories} ккал
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
