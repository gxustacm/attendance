const requestUserData = (setUserLogin, setUserInfo) => {
  fetch('api/user')
    .then((response) => response.json())
    .then((data) => {
      setUserInfo(data.stat)
      if (!data.stat) {
        setUserInfo({
          uid: data.uid,
          uname: data.uname,
          avatar: data.avatar
        })
      }
    })
    .catch((err) => {
      console.warn(err)
    })
}

export default requestUserData