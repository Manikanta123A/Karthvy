
export const getMyComplaints = async(req, res) => {
    try{
        const {adharNumber,state} = req.body;

        if(!adharNumber || !state){
            return res.status(400).json({ error: "Adhar number and state are required" });
        }
        const result = await Complains.find({ AadharNumber: adharNumber, state: state })
            .populate('AssignedWorker', 'name role')
            .sort({ createdAt: -1 });   

            
        if(!result || result.length === 0){
            return res.status(404).json({ message: "No complaints found for the given Aadhar number and state" });
        }
        return res.status(200).json({ complaints: result });

    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}