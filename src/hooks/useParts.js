import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; 

const useParts = (categoryParam = 'all') => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/parts');
        
        if (categoryParam === 'all') {
          setParts(res.data);
        } else if (categoryParam === 'others') {
          // ✅ ফিক্স: 'others' এ ক্লিক করলে 'ev' এবং 'others' দুটোই দেখাবে
          const filtered = res.data.filter(p => 
             ['ev', 'others'].includes(p.category.toLowerCase())
          );
          setParts(filtered);
        } else {
          // সাধারণ ফিল্টার (Brake, Engine, etc.)
          const filtered = res.data.filter(p => 
             p.category.toLowerCase() === categoryParam.toLowerCase()
          );
          setParts(filtered);
        }
      } catch (err) {
        console.error("Error fetching parts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [categoryParam]);

  return { parts, loading };
};

export default useParts;