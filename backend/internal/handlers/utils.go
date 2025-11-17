package handlers

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

func DeleteUploadedFiles(imageURLs []string) error {
	for _, url := range imageURLs {
		if strings.Contains(url, "/uploads/") {
			filename := filepath.Base(url)
			path := filepath.Join("/root/uploads", filename)
			if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
				return err
			}
		}
	}
	return nil
}

func SaveUploadedFiles(files []*multipart.FileHeader) ([]string, error) {
	var paths []string
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return nil, err
		}
		defer file.Close()

		// Validate file type
		contentType := fileHeader.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			return nil, fmt.Errorf("invalid file type: %s", contentType)
		}

		// Validate file size (5MB max)
		if fileHeader.Size > 5*1024*1024 {
			return nil, fmt.Errorf("file too large: %d bytes", fileHeader.Size)
		}

		// Ensure uploads directory exists
		if err := os.MkdirAll("/root/uploads", 0755); err != nil {
			return nil, fmt.Errorf("failed to create uploads directory: %v", err)
		}

		// Generate unique filename
		ext := filepath.Ext(fileHeader.Filename)
		filename := uuid.New().String() + ext
		path := filepath.Join("/root/uploads", filename)

		// Create destination file
		dst, err := os.Create(path)
		if err != nil {
			return nil, err
		}
		defer dst.Close()

		// Copy file content
		_, err = io.Copy(dst, file)
		if err != nil {
			return nil, err
		}

		paths = append(paths, "/uploads/"+filename)
	}
	return paths, nil
}

// transliterate converts Russian text to English transliteration
func transliterate(text string) string {
	translitMap := map[rune]string{
		'а': "a", 'б': "b", 'в': "v", 'г': "g", 'д': "d", 'е': "e", 'ё': "e",
		'ж': "zh", 'з': "z", 'и': "i", 'й': "y", 'к': "k", 'л': "l", 'м': "m",
		'н': "n", 'о': "o", 'п': "p", 'р': "r", 'с': "s", 'т': "t", 'у': "u",
		'ф': "f", 'х': "kh", 'ц': "ts", 'ч': "ch", 'ш': "sh", 'щ': "shch",
		'ъ': "", 'ы': "y", 'ь': "", 'э': "e", 'ю': "yu", 'я': "ya",
		'А': "A", 'Б': "B", 'В': "V", 'Г': "G", 'Д': "D", 'Е': "E", 'Ё': "E",
		'Ж': "Zh", 'З': "Z", 'И': "I", 'Й': "Y", 'К': "K", 'Л': "L", 'М': "M",
		'Н': "N", 'О': "O", 'П': "P", 'Р': "R", 'С': "S", 'Т': "T", 'У': "U",
		'Ф': "F", 'Х': "Kh", 'Ц': "Ts", 'Ч': "Ch", 'Ш': "Sh", 'Щ': "Shch",
		'Ъ': "", 'Ы': "Y", 'Ь': "", 'Э': "E", 'Ю': "Yu", 'Я': "Ya",
	}

	var result strings.Builder
	for _, r := range text {
		if translit, ok := translitMap[r]; ok {
			result.WriteString(translit)
		} else if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == ' ' {
			result.WriteRune(r)
		} else {
			result.WriteRune('_') // Replace non-alphanumeric with underscore
		}
	}
	return strings.ToLower(strings.ReplaceAll(result.String(), " ", "_"))
}
