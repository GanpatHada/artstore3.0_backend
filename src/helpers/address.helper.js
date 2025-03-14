function extractRequiredAddressFields(AddressObj)
{
    const{receiverName,
        mobileNumber,
        pinCode,
        address1,
        address2,
        city,
        state,
        country}=AddressObj;
        return {receiverName,
            mobileNumber,
            pinCode,
            address1,
            address2,
            city,
            state,
            country}
}

function checkRequiredFieldsMissingOrEmpty(requiredFields)
{
    console.log(requiredFields)
    return Object.values(requiredFields).some(field=>field === undefined || field.trim().length===0)
}
module.exports={extractRequiredAddressFields,checkRequiredFieldsMissingOrEmpty}
