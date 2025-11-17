UPDATE menu SET image_urls = array_replace(image_urls, 'https://localhost/uploads/', '/uploads/') WHERE array_to_string(image_urls, ',') LIKE '%https://localhost/uploads/%';
