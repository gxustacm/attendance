import React from "react"
import { ResponsiveCalendar } from '@nivo/calendar'
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
            width: '60vw',
            margin: '0 auto'
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
            <div style={{
                height: '20vh',
                margin: '40px'
            }}>
                <ResponsiveCalendar
                    data={data}
                    tooltip={getTooltip}
                    from={`${date.getFullYear()}-01-01`}
                    to={`${date.getFullYear()}-12-31`}
                    emptyColor="#eeeeee"
                    colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
                    margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                    monthBorderColor="#ffffff"
                    dayBorderWidth={2}
                    dayBorderColor="#ffffff"
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'row',
                            translateY: 36,
                            itemCount: 4,
                            itemWidth: 42,
                            itemHeight: 36,
                            itemsSpacing: 14,
                            itemDirection: 'right-to-left'
                        }
                    ]}
                />
            </div>
        </div>
    )
}

export default UserInfoPage