import { Link } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';

interface MenuItemCardProps {
  id: number;
  name: string;
  description: string;
  price: string;
  calories?: number;
  image?: string;
  variants?: string[];
  popular?: boolean;
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  calories,
  image,
  variants,
  popular
}: MenuItemCardProps) {
  return (
    <Link to={`/menu/${id}`} className="menu-item-card-link">
      <article className="menu-item-card">
        {image && (
          <div className="menu-item-card-image">
            <ImageWithFallback
              src={image}
              alt={name}
              className="menu-item-card-image-img"
            />
          </div>
        )}

        <div className="menu-item-card-content">
          <div className="menu-item-card-header">
            <div className="menu-item-card-title-group">
              <h3 className="menu-item-card-title">{name}</h3>
              {popular && (
                <span className="menu-item-card-popular">★</span>
              )}
            </div>
            <span className="menu-item-card-price">{price} ₽</span>
          </div>

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
