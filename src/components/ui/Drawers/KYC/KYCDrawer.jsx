import React, { useState, useEffect } from 'react';
import { BiX } from "react-icons/bi";
import { 
  Box, 
  Progress, 
  Text, 
  VStack, 
  HStack, 
  Badge, 
  Input, 
  FormControl, 
  FormLabel, 
  Textarea,
  Select,
  Button
} from "@chakra-ui/react";

const KYCDrawer = ({ closeDrawerHandler, kycProgress, totalLeads }) => {
  const [kycData, setKycData] = useState({
    name: '',
    phone: '',
    email: '',
    status: '',
    source: '',
    assigned: '',
    notes: '',
    prcQt: '',
    location: '',
    leadCategory: ''
  });

  const [currentProgress, setCurrentProgress] = useState(0);

  const getProgressColor = (progress) => {
    if (progress >= 80) return "green";
    if (progress >= 60) return "yellow";
    if (progress >= 40) return "orange";
    return "red";
  };

  const getProgressStatus = (progress) => {
    if (progress >= 80) return "Excellent";
    if (progress >= 60) return "Good";
    if (progress >= 40) return "Fair";
    return "Poor";
  };

  // Calculate progress based on filled fields
  const calculateProgress = (data) => {
    const totalFields = 10;
    let filledFields = 0;

    Object.values(data).forEach(value => {
      if (value && value.trim() !== '') {
        filledFields++;
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  };

  // Update progress when KYC data changes
  useEffect(() => {
    const progress = calculateProgress(kycData);
    setCurrentProgress(progress);
  }, [kycData]);

  const handleInputChange = (field, value) => {
    setKycData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Here you can add logic to save the KYC data
    console.log('KYC Data:', kycData);
    alert('KYC data saved successfully!');
  };

  const statusOptions = [
    { value: "New", label: "New" },
    { value: "In Negotiation", label: "In Negotiation" },
    { value: "Completed", label: "Completed" },
    { value: "Loose", label: "Loose" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Assigned", label: "Assigned" },
    { value: "On Hold", label: "On Hold" },
    { value: "Follow Up", label: "Follow Up" },
  ];

  const sourceOptions = [
    { value: "Linkedin", label: "Linkedin" },
    { value: "Social Media", label: "Social Media" },
    { value: "Website", label: "Website" },
    { value: "Advertising", label: "Advertising" },
    { value: "Friend", label: "Friend" },
    { value: "Professionals Network", label: "Professionals Network" },
    { value: "Customer Referral", label: "Customer Referral" },
    { value: "Sales", label: "Sales" },
    { value: "Digital Marketing", label: "Digital Marketing" },
    { value: "Upwork", label: "Upwork" },
    { value: "Gem", label: "Gem" },
    { value: "Freelancer", label: "Freelancer" },
    { value: "IndiaMart", label: "IndiaMart" },
    { value: "Fiverr", label: "Fiverr" },
  ];

  const categoryOptions = [
    { value: "Hot", label: "Hot" },
    { value: "Warm", label: "Warm" },
    { value: "Cold", label: "Cold" },
  ];

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[500px] bg-white right-0 top-0 z-10 py-3"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <h1 className="px-4 flex gap-x-2 items-center text-xl py-3 border-b">
        <BiX onClick={closeDrawerHandler} size="26px" />
        KYC Form
      </h1>

      <div className="mt-4 px-5 pb-5">
        <h2 className="text-xl font-bold py-3 text-center mb-4 border-y bg-blue-200 rounded-lg shadow-md">
          KYC Information Form
        </h2>

        {/* Progress Display */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="md" mb={4}>
          <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center">
            Current Progress
          </Text>
          
          <VStack spacing={3}>
            <Text fontSize="2xl" fontWeight="bold" color={getProgressColor(currentProgress)}>
              {currentProgress}%
            </Text>
            
            <Progress 
              value={currentProgress} 
              size="lg" 
              colorScheme={getProgressColor(currentProgress)}
              borderRadius="full"
              width="100%"
            />
            
            <Badge 
              colorScheme={getProgressColor(currentProgress)} 
              fontSize="md" 
              p={2}
              borderRadius="md"
            >
              {getProgressStatus(currentProgress)}
            </Badge>
          </VStack>
        </Box>

        {/* KYC Form */}
        <VStack spacing={4} align="stretch">
          {/* Name */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Name *</FormLabel>
            <Input
              value={kycData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              size="md"
              borderColor={kycData.name ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Phone */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Phone *</FormLabel>
            <Input
              value={kycData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              size="md"
              borderColor={kycData.phone ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Email */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Email *</FormLabel>
            <Input
              value={kycData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              type="email"
              size="md"
              borderColor={kycData.email ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Status */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Status *</FormLabel>
            <Select
              value={kycData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              placeholder="Select status"
              size="md"
              borderColor={kycData.status ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Source */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Source *</FormLabel>
            <Select
              value={kycData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              placeholder="Select source"
              size="md"
              borderColor={kycData.source ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            >
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Assigned */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Assigned To</FormLabel>
            <Input
              value={kycData.assigned}
              onChange={(e) => handleInputChange('assigned', e.target.value)}
              placeholder="Enter assigned person"
              size="md"
              borderColor={kycData.assigned ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Notes */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Notes</FormLabel>
            <Textarea
              value={kycData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter notes"
              size="md"
              rows={3}
              borderColor={kycData.notes ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* PRC QT */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">PRC QT</FormLabel>
            <Input
              value={kycData.prcQt}
              onChange={(e) => handleInputChange('prcQt', e.target.value)}
              placeholder="Enter PRC QT"
              size="md"
              borderColor={kycData.prcQt ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Location */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Location</FormLabel>
            <Input
              value={kycData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location"
              size="md"
              borderColor={kycData.location ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            />
          </FormControl>

          {/* Lead Category */}
          <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">Lead Category</FormLabel>
            <Select
              value={kycData.leadCategory}
              onChange={(e) => handleInputChange('leadCategory', e.target.value)}
              placeholder="Select category"
              size="md"
              borderColor={kycData.leadCategory ? "green.300" : "gray.300"}
              _focus={{ borderColor: "blue.500" }}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            colorScheme="blue"
            size="lg"
            mt={4}
            isDisabled={currentProgress < 30} // Disable if less than 30% complete
          >
            Save KYC Data ({currentProgress}% Complete)
          </Button>
        </VStack>

        {/* Progress Legend */}
        {/* <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" mt={4}>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Progress Legend:</Text>
          <VStack spacing={1} align="stretch">
            <HStack>
              <Box w={3} h={3} bg="green.500" borderRadius="sm"></Box>
              <Text fontSize="xs">80-100%: Excellent</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="yellow.500" borderRadius="sm"></Box>
              <Text fontSize="xs">60-79%: Good</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="orange.500" borderRadius="sm"></Box>
              <Text fontSize="xs">40-59%: Fair</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="red.500" borderRadius="sm"></Box>
              <Text fontSize="xs">0-39%: Poor</Text>
            </HStack>
          </VStack>
        </Box> */}
      </div>
    </div>
  );
};

export default KYCDrawer;
