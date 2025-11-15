package models

import "time"

type MenuItem struct {
	ID 			int 		`json:"id"`
	Title 		string 		`json:"title"`
	Price 		int			`json:"price"`
	ImageURLs 	[]string 	`json:"imageURLs"`
	Calories 	int 		`json:"calories,omitempty"`
	Description string		`json:"description,omitempty"`
	Category 	string		`json:"category"`
	CreatedAt	time.Time	`json:"createdAt"`
	UpdatedAt	time.Time	`json:"updatedAt"`
}