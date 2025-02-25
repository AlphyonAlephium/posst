
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { HotDealPopupInfo } from './types';

interface MapHotDealPopupProps {
  activeHotDeal: HotDealPopupInfo | null;
  map: React.MutableRefObject<mapboxgl.Map | null>;
  onClose: () => void;
}

export const MapHotDealPopup = ({ activeHotDeal, map, onClose }: MapHotDealPopupProps) => {
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (activeHotDeal && map.current) {
      if (popupRef.current) {
        popupRef.current.remove();
      }

      popupRef.current = new mapboxgl.Popup({ closeButton: false, maxWidth: '300px' })
        .setLngLat(activeHotDeal.coordinates)
        .setDOMContent(document.createElement('div'))
        .addTo(map.current);

      const popupContainer = popupRef.current.getElement();
      const contentDiv = popupContainer.querySelector('.mapboxgl-popup-content');
      
      if (contentDiv && activeHotDeal.deal) {
        // Clear any existing content
        while (contentDiv.firstChild) {
          contentDiv.removeChild(contentDiv.firstChild);
        }
        
        // Create a div to render our content into
        const hotDealContainer = document.createElement('div');
        contentDiv.appendChild(hotDealContainer);
        
        // Create root element
        const root = document.createElement('div');
        hotDealContainer.appendChild(root);
        
        // Create popup element
        const popupElement = document.createElement('div');
        popupElement.className = "bg-white rounded-lg shadow-lg overflow-hidden w-64";
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = "relative";
        
        // Create image
        const img = document.createElement('img');
        img.src = activeHotDeal.deal.image_url;
        img.alt = activeHotDeal.deal.title;
        img.className = "w-full h-32 object-cover";
        imageContainer.appendChild(img);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = "absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity";
        closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeButton.onclick = onClose;
        imageContainer.appendChild(closeButton);
        
        // Check if deal is active
        const startTime = new Date(activeHotDeal.deal.start_time);
        const endTime = new Date(startTime.getTime() + activeHotDeal.deal.duration_hours * 60 * 60 * 1000);
        const isActive = new Date() >= startTime && new Date() <= endTime;
        
        if (isActive) {
          const activeTag = document.createElement('div');
          activeTag.className = "absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-md";
          activeTag.textContent = "Active Now!";
          imageContainer.appendChild(activeTag);
        }
        
        popupElement.appendChild(imageContainer);
        
        // Create content div
        const content = document.createElement('div');
        content.className = "p-3";
        
        // Title
        const title = document.createElement('h3');
        title.className = "font-bold text-lg truncate";
        title.textContent = activeHotDeal.deal.title;
        content.appendChild(title);
        
        // Company name
        const company = document.createElement('p');
        company.className = "text-sm text-gray-600 mb-2";
        company.textContent = activeHotDeal.deal.company_name;
        content.appendChild(company);
        
        // Description
        const description = document.createElement('p');
        description.className = "text-sm line-clamp-3";
        description.textContent = activeHotDeal.deal.description;
        content.appendChild(description);
        
        // Time info
        const timeInfo = document.createElement('div');
        timeInfo.className = "mt-2 text-xs text-gray-500";
        
        const timeText = document.createElement('p');
        if (isActive) {
          timeText.textContent = `Ends at ${endTime.toLocaleTimeString()}`;
        } else {
          timeText.textContent = `Starts at ${startTime.toLocaleTimeString()}`;
        }
        timeInfo.appendChild(timeText);
        
        content.appendChild(timeInfo);
        popupElement.appendChild(content);
        
        root.appendChild(popupElement);
      }
    }

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [activeHotDeal, map, onClose]);

  return null; // This is a non-visual component that manages the popup
};
