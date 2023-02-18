export function getWeather (req, res, next) {
  req.visitorWeather = true
  if(req.visitorWeather) {
  // next calls the next function being passed to the app router
  next()
  } else {
    res.send('Come back later')
  }
}
