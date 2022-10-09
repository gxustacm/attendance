import React from "react"
import { Calendar } from '@nivo/calendar'
import { Avatar, IconButton, Typography } from "@mui/material"

const UserInfoPage = (props) => {
    const [data, setData] = React.useState([])

    const getTooltip = (toShow) => {
        return (
            <div
                style={{
                    padding: '8px',
                    backgroundColor: '#fff',
                    fontSize: '10px',
                    lineHeight: '10px'
                }}
            >
                <div 
                    style={{
                        backgroundColor: toShow.color,
                        width: '10px',
                        height: '10px',
                        margin: '0px 5px',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                    }}
                />
                <div
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle'
                    }}
                >
                    { toShow.day }:&nbsp;{ toShow.value }小时
                </div>
            </div>
        )
    }

    React.useEffect(() => {
        let tmp = []
        for (let key in props.onlineData) {
            tmp.push({
                value: parseInt(props.onlineData[key] * 10) / 10,
                day: key
            })
        }
        setData(tmp)
    }, [props.onlineData])

    const date = new Date()

    return (
        <div style={{
            margin: '0 auto',
            width: '900px'
        }}>
            <div style={{
                marginTop: '100px',
                lineHeight: '60px'
            }}>
                <IconButton>
                    <Avatar
                        src={`https://ixnet.icu/avatar/${props.user.avatar.toLowerCase()}`}
                        sx={{ 
                            width: 72, 
                            height: 72, 
                            display: 'inline-block',
                            verticalAlign: 'middle'
                        }}
                    />
                </IconButton>
                <Typography
                    variant='h2'
                    sx={{ 
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        margin: '0 20px',
                        color: '#222'
                    }}
                >
                    Hello {props.user.uname},
                </Typography>
            </div>
            <div 
                style={{
                    margin: '40px',
                    backgroundColor: '#fff',
                    boxShadow: '5px 5px 20px 1px #eee',
                    borderRadius: '3px',
                    padding: '10px 30px 20px 30px'
                }}
            >
                <Typography
                    variant='h5'
                    sx={{
                        margin: '20px 0'
                    }}
                >
                    历史在线
                </Typography>
                <Calendar
                    height={140}
                    width={750}
                    data={data}
                    tooltip={getTooltip}
                    from={`${date.getFullYear()}-01-01`}
                    to={`${date.getFullYear()}-12-31`}
                    emptyColor="#eeeeee"
                    colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
                    margin={{ top: 0, right: 40, bottom: 0, left: 40 }}
                    monthBorderColor="#ffffff"
                    dayBorderWidth={2}
                    dayBorderColor="#ffffff"
                />
            </div>
        </div>
    )
}

export default UserInfoPage