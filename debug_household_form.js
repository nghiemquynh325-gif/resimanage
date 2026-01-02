// Debug script - Add this temporarily to HouseholdFormModal.tsx useEffect
// to see what data is being passed

useEffect(() => {
    if (isOpen && initialData) {
        console.log('=== HOUSEHOLD EDIT DEBUG ===');
        console.log('initialData:', initialData);
        console.log('headOfHouseholdId:', initialData.headOfHouseholdId);
        console.log('memberIds:', initialData.memberIds);
        console.log('memberIds length:', initialData.memberIds?.length);
        console.log('relationships:', initialData.relationships);
        console.log('isPoorHousehold:', initialData.isPoorHousehold);
        console.log('poorHouseholdNotes:', initialData.poorHouseholdNotes);
        console.log('===========================');
    }
}, [isOpen, initialData]);
