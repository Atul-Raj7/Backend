const asyncHandeler = (requestHandeler) => {
    Promise.resolve(requestHandeler(req, res, next)).catch((err) => next(err))
}






    export { asyncHandeler }

    

                               // OR //



    // const asyncHandeler = () => {}
    // const asyncHandeler = (function) => () => {}
    // const asyncHandeler = (function) => async() => {}


        // const asyncHandeler = (fn) => async(req, res, next) => {
        //     try {
        //         await fn(req, res, next)
        //     } catch (error) {   
        //         res.status(error.code || 500).json({
        //             success: false,
        //             message: error.message
        //         })
        //     }
        // }