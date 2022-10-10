import React from "react"
import { Calendar } from '@nivo/calendar'
import { Avatar, IconButton, Typography, Badge, Button } from "@mui/material"
import { styled } from '@mui/material/styles'

const UserInfoPage = (props) => {
    const [data, setData] = React.useState([])
    const [greeting, setGreeting] = React.useState('')

    const OnlineIndicator = styled(Badge)(({ theme }) => ({
        '& .MuiBadge-badge': {
            backgroundColor: props.disconnected ? '#ee3333' : '#44b700',
            color: props.disconnected ? '#ee3333' : '#44b700',
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            '&::after': {
                position: 'absolute',
                top: -2,
                left: -2,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                animation: 'ripple 1.5s infinite',
                border: props.disconnected ? 'none' : '2px solid currentColor',
                content: '""',
            },
        },
        '@keyframes ripple': {
            '0%': {
                transform: 'scale(.5)',
                opacity: 1
            },
            '90%': {
                transform: 'scale(2.4)',
                opacity: 0
            },
            '100%': {
                transform: 'scale(2.4)',
                opacity: 0
            }
        }
    }))

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
                    {toShow.day}:&nbsp;{toShow.value}小时
                </div>
            </div>
        )
    }

    const genGreeting = (uname) => {
        let gret = parseInt(Math.random() * 6)
        let greetings = [
            `你好 ${uname},`,
            `Hello ${uname},`,
            `こんにちは! ${uname},`,
            `Bonjour, ${uname},`,
            `Hallo ${uname},`,
            `¡Hola! ${uname}`
        ]
        return greetings[gret]
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
        setGreeting(genGreeting(props.user.uname))
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
                <IconButton
                    onClick={() => {
                        window.open('https://gravatar.com/emails/', '_blank')
                    }}
                >
                    <OnlineIndicator
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                    >
                        <Avatar
                            src={`https://ixnet.icu/avatar/${props.user.avatar.toLowerCase()}`}
                            sx={{
                                width: 72,
                                height: 72,
                                display: 'inline-block',
                                verticalAlign: 'middle'
                            }}
                        />
                    </OnlineIndicator>
                </IconButton>
                <Typography
                    variant='h2'
                    sx={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        margin: '0 20px',
                        color: '#222',
                        textShadow: '5px 5px 3px #eee',
                        userSelect: 'none'
                    }}
                >
                    {greeting}
                </Typography>
            </div>
            <div
                style={{
                    margin: '40px',
                    backgroundColor: '#fff',
                    boxShadow: '5px 5px 20px 1px #eee',
                    borderRadius: '3px',
                    padding: '10px 30px 20px 30px',
                    textAlign: 'center'
                }}
            >
                <Typography
                    variant='h5'
                    sx={{
                        margin: '20px 0',
                        textAlign: 'left'
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
                    colors={['#6aff6a', '#60dd60', '#4fbb4f', '#419941' ,'#307730']}
                    margin={{ top: 0, right: 40, bottom: 0, left: 40 }}
                    monthBorderColor="#ffffff"
                    dayBorderWidth={2}
                    dayBorderColor="#ffffff"
                />
            </div>
            <div>
                {
                    props.disconnected && (
                        <Button
                            variant='outlined'
                            onClick={props.handleReconnect}
                        >
                            重新连接
                        </Button>
                    )
                }
            </div>
        </div>
    )
}

export default UserInfoPage