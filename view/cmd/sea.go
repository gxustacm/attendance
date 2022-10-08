package cmd

import (
	"fmt"
	"log"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/EduarteXD/attendance/sea/database"
	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "show user info",
	Run: func(cmd *cobra.Command, args []string) {
		info, err := database.QueryUserList()
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%-4s  %-16s %-30s %-14s %-14s\n", "uid", "username", "email", "role", "realname")
		for _, v := range info {
			fmt.Printf("%-4d  %-16s %-30s %-14s", v.ID, v.Name, v.Email, v.Role)
			printRune(v.Realname, 18)
			fmt.Println()
		}
	},
}

var weekCmd = &cobra.Command{
	Use:   "week",
	Short: "statistic of check in",
	Run: func(cmd *cobra.Command, args []string) {
		now := time.Now().AddDate(0, 0, -7)
		start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		fmt.Println("since ", start.Format("2006-01-02 15:04"))
		var statistics, err = database.QueryStatisticAfter(start)
		if err != nil {
			log.Fatal(err)
		}
		uidMp, err := database.QueryMapUidName()
		if err != nil {
			log.Fatal(err)
		}
		var res = make(map[int]time.Duration)
		for _, v := range statistics {
			res[v.Uid] += v.End.Sub(v.Start)
		}
		fmt.Printf("%-15sduration\n", "realname")
		for i, v := range res {
			printRune(uidMp[i], 15)
			fmt.Printf("%dh%dm\n", v.Milliseconds()/1000/60/60, v.Milliseconds()/1000/60/60%60)
		}
	},
}

func printRune(in string, length int) {
	a := utf8.RuneCountInString(in)
	b := len(in)
	z := (b - a) / 2
	var le = length - a - z
	if le < 0 {
		le = 0
	}
	fmt.Print(in + strings.Repeat(" ", le))
}
