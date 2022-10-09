import React from 'react'
import { LinearProgress, Box, Avatar, Typography } from '@mui/material'

const LoadingPage = () => {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: 999
      }}
    >
      <LinearProgress />
      <Box
        sx={{
          width: '80vw',
          margin: 'auto',
          textAlign: 'center',
          marginTop: 'calc(50vh - 120px)'
        }}
      >
        <Avatar
          sx={{
            width: 192,
            height: 192,
            margin: 'auto',
            left: '0',
            right: '0'
          }}
          src='loading.svg'
        />
        <Typography
          variant='h6'
          sx={{
            padding: '20px 20px 20px 20px',
            fontFamily: 'Roboto, sans-serif'
          }}
        >
          Loading
        </Typography>
      </Box>
    </div>
  )
}

export default LoadingPage