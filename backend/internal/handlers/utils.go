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
		if strings.HasPrefix(url, "http://localhost:8080/uploads/") {
			filename := strings.TrimPrefix(url, "http://localhost:8080/uploads/")
			path := filepath.Join("uploads", filename)
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

		// Generate unique filename
		ext := filepath.Ext(fileHeader.Filename)
		filename := uuid.New().String() + ext
		path := filepath.Join("uploads", filename)

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

		paths = append(paths, "http://localhost:8080/uploads/"+filename)
	}
	return paths, nil
}
