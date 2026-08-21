// useFoods.js
import { useState, useEffect } from "react";
import { getFoods } from "../services/foodService";

export const useFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFoods().then((data) => {
      setFoods(data);
      setLoading(false);
    });
  }, []);

  return { foods, loading };
};
