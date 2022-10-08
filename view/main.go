package main

import (
	"time"

	"github.com/EduarteXD/attendance/sea/cmd"
)

func main() {
	time.LoadLocation("Asia/Shanghai")
	cmd.Execute()
}
