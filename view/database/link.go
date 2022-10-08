package database

import (
	"fmt"
	"log"
	"time"

	"github.com/briandowns/spinner"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	dbname   string
	username string
	password string
	host     string
	port     string
)

var db *gorm.DB

const dsn = "%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local"

func init() {
	viper.SetConfigFile("./config.yaml")
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal(err)
	}
	dbname = viper.GetString("dbname")
	username = viper.GetString("username")
	password = viper.GetString("password")
	host = viper.GetString("host")
	port = viper.GetString("port")
	s := spinner.New(spinner.CharSets[34], 100*time.Millisecond)
	s.Prefix = "link database"
	s.Start()
	db, err = gorm.Open(mysql.Open(fmt.Sprintf(dsn, username, password, host, port, dbname)), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})
	s.Stop()
	if err != nil {
		log.Fatal(err)
	} else {
		fmt.Println("database link success")
	}
}
