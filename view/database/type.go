package database

import "time"

type User struct {
	ID       int    `gorm:"column:uid"`
	Name     string `gorm:"column:name"`
	Email    string `gorm:"column:email"`
	Role     string `gorm:"column:role"`
	Realname string `gorm:"column:realname"`
}

type Statistic struct {
	ID    int
	Start time.Time
	End   time.Time
	Uid   int
}

type OnlineInfo struct {
	Online []int `json:"online"`
}
