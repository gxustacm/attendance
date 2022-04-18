const requestUserData = (callback) => {
  fetch('api/user')
    .then((response) => response.json())
    .then((data) => {
      if (data.ok) {
        callback(true, {
          uid: data.uid,
          uname: data.uname,
          avatar: data.avatar
        })
      }
      else {
        callback(false)
      }
    })
    .catch((err) => {
      console.warn(err)
    })
}

export default requestUserData