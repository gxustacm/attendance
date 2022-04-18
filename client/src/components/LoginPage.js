import React from 'react'
import { Box, Paper, TextField } from '@mui/material'

const LoginPage = () => {
  return (
    <>
      <Paper
        sx={{
          border: 'solid',
          width: '550px',
          margin: '0 auto',
          textAlign: 'center',
          verticalAlign: 'center',
        }}
      >
        <TextField />
      </Paper>
    </>
  )
}

export default LoginPage