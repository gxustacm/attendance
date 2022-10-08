package database

import "time"

func QueryUserList() ([]User, error) {
	var users []User
	err := db.Find(&users).Error
	if err != nil {
		return nil, err
	} else {
		return users, err
	}
}

func QueryMapUidName() (map[int]string, error) {
	var users, err = QueryUserList()
	if err != nil {
		return nil, err
	}
	mp := make(map[int]string)
	for _, v := range users {
		mp[v.ID] = v.Realname
	}
	return mp, nil
}

func QueryStatisticAfter(t time.Time) ([]Statistic, error) {
	var res []Statistic
	err := db.Where("start > ?", t).Find(&res).Error
	if err != nil {
		return nil, err
	} else {
		return res, nil
	}
}
