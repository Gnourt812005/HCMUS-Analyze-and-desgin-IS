import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RoomCard = ({ id, imageSrc, imageAlt, badgeText, badgeColorType, title, location, price, rating }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleCardClick = () => {
    if (!isLoggedIn) {
      toast.error('Need to sign in to use this feature');
      navigate('/login');
    } else {
      navigate(`/room/${id}`);
    }
  };

  const badgeColorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    error: 'text-error'
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-500 border border-outline-variant/10"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          alt={imageAlt}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          src={imageSrc}
        />
        {badgeText && (
          <div className="absolute top-4 left-4">
            <span className={`bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${badgeColorMap[badgeColorType] || 'text-primary'}`}>
              {badgeText}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-headline text-lg font-bold text-on-surface truncate-2-lines mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-outline mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">location_on</span> {location}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <span className="text-xl font-extrabold text-secondary">
            {price} <small className="text-xs font-medium text-outline">/tháng</small>
          </span>
          <div className="flex items-center gap-1 text-secondary-container">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-xs font-bold text-on-surface">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
