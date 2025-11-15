package models

import "time"

type News struct {
	ID 			int 		`json:"id"`
	Title 		string 		`json:"title"`
	Preview		string		`json:"preview"`
	Description string 		`json:"description"`
	ImageURLs 	[]string 	`json:"imageURLs"`
	CreatedAt 	time.Time 	`json:"createdAt"`
	UpdatedAt 	time.Time 	`json:"updatedAt"`
	PostedAt 	time.Time 	`json:"postedAt"`
}