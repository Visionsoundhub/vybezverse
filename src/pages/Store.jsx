import React from 'react';
import { motion } from 'framer-motion';
import storeData from '../data/store.json';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import './Store.css';

const Store = () => {
  return (
    <div className="store-page container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{storeData.title}</h1>
        <p>Your one-stop shop for everything</p>
      </motion.div>

      <div className="store-content">
        <motion.div 
          className="store-bundle-card glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bundle-header">
            <h2>{storeData.sectionTitle}</h2>
            <p>{storeData.subtitle}</p>
          </div>
          
          <ul className="bundle-list">
            {storeData.bundleItems.map((item, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <CheckCircle2 color="#bc74f5" size={20} />
                <span>{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {storeData.merchActive && (
          <motion.div 
            className="merch-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ShoppingBag size={48} color="#ff1493" />
            <h2>MERCHANDISE</h2>
            <p className="neon-text-pink">{storeData.comingSoonText}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Store;
