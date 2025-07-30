// hooks/useCSVExport.js
import { useCallback } from 'react';

const useCSVExport = () => {
  const generateCSVContent = useCallback((posts) => {
    if (!posts || posts.length === 0) return null;

    const headers = [
      'Title', 
      'Description', 
      'Latitude', 
      'Longitude', 
      'Date Created', 
      'Category', 
      'Status'
    ].join(',');

    const rows = posts.map(post => {
      const escape = (str) => `"${String(str).replace(/"/g, '""')}"`;
      const date = new Date(post.created_at).toLocaleDateString();

      return [
        escape(post.title || ''),
        escape(post.description || ''),
        post.latitude,
        post.longitude,
        date,
        escape(post.category || 'Uncategorized'),
        escape(post.status || 'Unknown')
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }, []);

  const downloadCSV = useCallback((csvContent, fileName) => {
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName || 'posts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportToCSV = useCallback((posts, fileName) => {
    try {
      if (!posts?.length) {
        throw new Error('No posts selected for export');
      }

      const csvContent = generateCSVContent(posts);
      downloadCSV(csvContent, fileName);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      alert(error.message);
      return false;
    }
  }, [generateCSVContent, downloadCSV]);

  return exportToCSV;
};

export default useCSVExport;