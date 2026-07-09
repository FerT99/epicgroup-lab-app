import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './PlanetDetailScreen.css';

import image36 from '../assets/image36.png';
import image37 from '../assets/image37.png';
import image38 from '../assets/image38.png';
import image39 from '../assets/image39.png';
import image40 from '../assets/image40.png';
import image41 from '../assets/image41.png';
import image42 from '../assets/image42.png';
import image43 from '../assets/image43.png';
import image1 from '../assets/image1.png';

const PLANET_ASSETS = [
  image36, image37, image38, image39, image40, image41, image42, image43
];

interface PlanetDetailScreenProps {
  user: User;
}

const PlanetDetailScreen: React.FC<PlanetDetailScreenProps> = ({ user }) => {
  const { courseId, planetId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { pdfUrl?: string; title?: string } | null;

  const title = state?.title || `Curso ${courseId}`;
  
  const [subPlanets, setSubPlanets] = useState<any[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        if (!courseId) return;
        const res = await fetch(`http://localhost:3001/api/admin/subjects/${courseId}/modules`);
        if (!res.ok) throw new Error('Error fetching modules');
        const data = await res.json();
        
        const numSubPlanets = data.length;
        const radius = 250; 
        const items = data.map((module: any, i: number) => {
          const angle = (i / numSubPlanets) * (2 * Math.PI);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const asset = PLANET_ASSETS[i % PLANET_ASSETS.length];
          return { id: module.id, moduleId: module.id, title: module.title, x, y, asset };
        });
        setSubPlanets(items);
      } catch (err) {
        console.error("Error fetching modules:", err);
      }
    };
    fetchModules();
  }, [courseId]);

  const handleSubPlanetClick = (module: any) => {
    navigate(`/course/${courseId}/content/${module.moduleId}`, {
      state: { title: module.title }
    });
  };

  const handleBack = () => {
    navigate('/assignments');
  };

  return (
    <div className="planet-detail-screen">
      <div className="pd-header">
        <button className="btn-back" onClick={handleBack}>
          ← Volver
        </button>
        <h1 className="pd-title">{title}</h1>
      </div>

      {/* Fondo espacial */}
      <div className="space-background">
        <div className="stars"></div>
        <div className="nebula"></div>
      </div>

      <div className="solar-system">
        {/* Planeta central */}
        <div className="central-planet" onClick={handleSubPlanetClick}>
          <img src={image1} alt="Planeta Central" />
          <div className="central-title">Núcleo</div>
        </div>

        {/* Planetas orbitando */}
        {subPlanets.map((sp) => (
          <div
            key={sp.id}
            className="orbiting-planet"
            style={{
              transform: `translate(calc(-50% + ${sp.x}px), calc(-50% + ${sp.y}px))`
            }}
            onClick={() => handleSubPlanetClick(sp)}
          >
            <img src={sp.asset} alt={`Sub-planeta ${sp.id}`} />
            <div className="sub-title">{sp.title}</div>
          </div>
        ))}

        {/* Anillo orbital */}
        <div className="orbit-ring"></div>
      </div>
    </div>
  );
};

export default PlanetDetailScreen;
