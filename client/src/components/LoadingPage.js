import React from 'react'
import { LinearProgress, Box, Avatar } from '@mui/material'

const LoadingPage = () => {
  return (
    <>
      <LinearProgress />
      <Box
        sx={{
          width: '80vw',
          margin: 'auto',
          left: '0',
          right: '0',
          textAlign: 'center',
          marginTop: 'calc(50vh - 96px)'
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
      </Box>
    </>
  )
}

export default LoadingPage