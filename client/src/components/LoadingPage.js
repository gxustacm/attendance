import React from 'react'
import { LinearProgress, Box, Avatar, Typography } from '@mui/material'

const LoadingPage = () => {
  return (
    <>
      <LinearProgress />
      <Box
        sx={{
          width: '80vw',
          margin: 'auto',
          position: 'fixed',
          left: '0',
          right: '0',
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
    </>
  )
}

export default LoadingPage