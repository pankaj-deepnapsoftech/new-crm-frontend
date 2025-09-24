import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  TableContainer,
  Text,
  Th,
  Thead,
  Tr,
  Tbody,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { FaCaretDown, FaCaretUp, FaDownload } from "react-icons/fa";
import {
  MdContactPhone,
  MdOutlineVisibility,
  MdEdit,
  MdDeleteOutline,
  MdEditSquare,
} from "react-icons/md";
import { FaArrowsAlt } from "react-icons/fa";
import { useTable, useSortBy, usePagination } from "react-table";
import { useCookies } from "react-cookie";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { closeKYCDrawer, openKYCDrawer, openMoveToDemoDrawer } from "../../redux/reducers/misc";

import { toast } from "react-toastify";
import { FaUserShield } from "react-icons/fa6";
import KYCDrawer from "../ui/Drawers/KYC/KYCDrawer";
import ClickMenu from "../ui/ClickMenu";

const columns = [
  {
    Header: "Created By",
    accessor: "creator",
  },
  {
    Header: "Created On",
    accessor: "created_on",
  },
  {
    Header: "Type",
    accessor: "leadtype",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Phone",
    accessor: "phone",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Demo DateTime",
    accessor: "demoDateTime",
  },
  {
    Header: "Demo Type",
    accessor: "demoType",
  },
  {
    Header: "Demo Notes",
    accessor: "demoNotes",
  },
];

const Demo = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataId, setDataId] = useState(null);
  const [completingLeadId, setCompletingLeadId] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [riFile, setRiFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const { kycDrawerIsOpened } = useSelector((state) => state.misc)
  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const [leadData, setLeadData] = useState([])
  const statusStyles = {
    "scheduled demo": {
      bg: "#e6f7ff",
      text: "#1890ff",
    },
    "demo completed": {
      bg: "#f6ffed",
      text: "#52c41a",
    },
  };

  const openCompletionModal = (leadId) => {
    setSelectedLeadId(leadId);
    setRiFile(null);
    onOpen();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setRiFile(file);
  };

  const testImageService = async () => {
    try {
      console.log("Testing image service connectivity...");
      const response = await fetch("https://images.deepmart.shop/upload", {
        method: "GET",
      });
      console.log("Service test response status:", response.status);
      return response.status;
    } catch (error) {
      console.error("Service test failed:", error);
      return null;
    }
  };

  const uploadRIFileToLocalService = async (file) => {
    try {
      console.log("Attempting local upload fallback...");

      const formData = new FormData();
      formData.append("riFile", file);

      const response = await fetch(`${baseURL}lead/upload-ri`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Local upload response:", result);

      if (result.success && result.fileUrl) {
        return result.fileUrl;
      } else {
        console.error("Local upload failed:", result);
        return null;
      }
    } catch (error) {
      console.error("Local upload error:", error);
      return null;
    }
  };

  const uploadRIFileToImageService = async (file) => {
    try {
      console.log("Starting file upload...");
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });

      // Test service connectivity first
      const serviceStatus = await testImageService();
      if (!serviceStatus) {
        console.log("External service unavailable, trying local upload...");
        const localUrl = await uploadRIFileToLocalService(file);
        if (localUrl) {
          alert("External service unavailable. File uploaded to local server.");
          return localUrl;
        } else {
          alert(
            "Both external and local upload failed. Please try again later."
          );
          return null;
        }
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.error("File too large:", file.size);
        alert(
          "File size is too large. Please select a file smaller than 10MB."
        );
        return null;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        console.error("Invalid file type:", file.type);
        alert(
          "Invalid file type. Please select a PDF, Excel, CSV, or Word document."
        );
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);

      console.log(
        "Sending upload request to:",
        "https://images.deepmart.shop/upload"
      );

      const res = await axios.post(
        "https://images.deepmart.shop/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 seconds timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

    

      if (res.status === 200 && res.data) {
        const fileUrl = res.data?.[0];
        console.log("Extracted file URL:", fileUrl);

        if (!fileUrl) {
          console.error("No file URL in response");
          // Try local upload as fallback
          console.log(
            "External service returned no URL, trying local upload..."
          );
          const localUrl = await uploadRIFileToLocalService(file);
          if (localUrl) {
            alert(
              "External service issue detected. File uploaded to local server."
            );
            return localUrl;
          }
          return null;
        }

        return fileUrl;
      } else {
        console.error("Unexpected response:", res);
        // Try local upload as fallback
        console.log(
          "External service returned unexpected response, trying local upload..."
        );
        const localUrl = await uploadRIFileToLocalService(file);
        if (localUrl) {
          alert(
            "External service issue detected. File uploaded to local server."
          );
          return localUrl;
        }
        return null;
      }
    } catch (error) {
      console.error("RI file upload failed:", error);

      if (error.response) {
        // Server responded with error
        console.error("Server error response:", error.response.data);
        console.error("Server error status:", error.response.status);
      } else if (error.request) {
        // Network error
        console.error("Network error:", error.request);
      } else {
        // Other error
        console.error("Upload error:", error.message);
      }

      // Try local upload as fallback
      console.log("External upload failed, trying local upload...");
      const localUrl = await uploadRIFileToLocalService(file);
      if (localUrl) {
        alert("External service failed. File uploaded to local server.");
        return localUrl;
      } else {
        alert("Both external and local upload failed. Please try again later.");
        return null;
      }
    }
  };

  const markAsCompleted = async () => {
    if (!riFile) {
      alert("Please select an RI file before completing the demo.");
      return;
    }

    setUploading(true);
    try {
      console.log("Starting demo completion process...");
      console.log("Selected file:", riFile.name);

      // First upload the RI file to the image service
      const uploadedFileUrl = await uploadRIFileToImageService(riFile);
      console.log("Upload result:", uploadedFileUrl);

      if (!uploadedFileUrl) {
        alert("Failed to upload RI file. Please try again.");
        setUploading(false);
        return;
      }

      console.log("Sending completion request with URL:", uploadedFileUrl);

      // Send the lead completion request with the uploaded file URL
      const response = await fetch(`${baseURL}lead/complete-demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          leadId: selectedLeadId,
          riFileUrl: uploadedFileUrl,
        }),
      });

      const result = await response.json();
      console.log("Complete demo response:", result);

      if (result.success) {
        fetchScheduledDemoLeads();
        onClose();
        toast.success("Demo marked as completed successfully!");
      } else {
        alert("Failed to mark demo as completed: " + result.message);
      }
    } catch (error) {
      console.error("Error marking demo as completed:", error);
      alert("Error marking demo as completed");
    } finally {
      setUploading(false);
    }
  };

  const downloadRIFile = async (leadId, leadName) => {
    try {
      console.log("Attempting to download RI file for lead:", leadId, leadName);

      const response = await fetch(`${baseURL}lead/download-ri/${leadId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const result = await response.json();
      console.log("Download response:", result);

      if (result.success && result.fileUrl) {
        console.log("File URL received:", result.fileUrl);

        const link = document.createElement("a");
        link.href = result.fileUrl;
        link.download = `RI_${leadName}_${leadId}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.open(result.fileUrl, "_blank");
      } else {
        console.error("Download failed:", result);
        alert(
          "Failed to get RI file URL: " + (result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error downloading RI file:", error);
      alert("Error downloading RI file: " + error.message);
    }
  };

  const fetchScheduledDemoLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}lead/all-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        let scheduledDemoLeads = data.leads.filter(
          (lead) =>
            lead.status === "Scheduled Demo" || lead.status === "Demo Completed"
        );

        if (statusFilter !== "all") {
          scheduledDemoLeads = scheduledDemoLeads.filter(
            (lead) => lead.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }

        const transformedData = scheduledDemoLeads.map((lead) => ({
          ...lead,
          demoDateTime: lead.demo?.demoDateTime
            ? moment(lead.demo.demoDateTime).format("DD/MM/YYYY HH:mm")
            : "Not Set",
          demoType: lead.demo?.demoType || "Not Set",
          demoNotes: lead.demo?.notes || "No Notes",
        }));

        setData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching scheduled demo leads:", error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const fetchLead = async () => {
      if (!dataId) return;
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}lead/lead-details`,
          { leadId: dataId },
          {
            headers: { Authorization: `Bearer ${cookies?.access_token}` },
          }
        );

        if (response.data.success) {
          const lead = response?.data;
          setLeadData(lead);
          console.log(lead)
        }
      } catch (err) {
        console.error("Error fetching lead KYC:", err);
      }
    };
  console.log()
    fetchLead();
  }, []);

  console.log(leadData)

  useEffect(() => {
    fetchScheduledDemoLeads();
  }, [statusFilter]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  } = useTable(
    {
      columns,
      data: data,
      initialState: { pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  function getCategoryColor(category) {
    switch (category?.toLowerCase()) {
      case "hot":
        return "red";
      case "warm":
        return "orange";
      case "cold":
        return "blue";
      default:
        return "gray";
    }
  }

  if (loading) {
    return (
      <Box p={6}>
        <Heading size="md" mb={4}>
          Scheduled Demos
        </Heading>
        <Text>Loading...</Text>
      </Box>
    );
  }


  return (
    <Box p={6}>
      <div className="flex justify-between items-center mb-4">
        <Heading size="md" mb={4}>
          Scheduled Demos
        </Heading>
        <div className="flex gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled demo">Scheduled Demo</option>
            <option value="demo completed">Demo Completed</option>
          </select>

          <button
            className="border border-blue-700 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-700 hover:text-white transition-colors"
            onClick={fetchScheduledDemoLeads}
          >
            Refresh
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <Text color="gray.500" textAlign="center" mt={8}>
          No scheduled demos found.
        </Text>
      ) : (
        <div>
          <TableContainer
            maxHeight="600px"
            overflowY="auto"
            className="shadow-lg rounded-lg bg-white"
          >
            <Table
              {...getTableProps()}
              borderWidth="1px"
              borderColor="#e0e0e0"
              className="min-w-full"
            >
              <Thead
                position="sticky"
                top={0}
                zIndex={1}
                bg="blue.400"
                color="white"
                boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
                className="text-lg font-semibold"
              >
                {headerGroups.map((hg) => {
                  return (
                    <Tr {...hg.getHeaderGroupProps()}>
                      {hg.headers.map((column) => {
                        return (
                          <Th
                            bg="blue.400"
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                            textTransform="capitalize"
                            fontSize="15px"
                            fontWeight="700"
                            color="white"
                          >
                            <div className="flex items-center">
                              {column.render("Header")}
                              {column.isSorted && (
                                <span>
                                  {column.isSortedDesc ? (
                                    <FaCaretDown />
                                  ) : (
                                    <FaCaretUp />
                                  )}
                                </span>
                              )}
                            </div>
                          </Th>
                        );
                      })}
                      <Th
                        textTransform="capitalize"
                        fontSize="15px"
                        fontWeight="700"
                        color="white"
                        borderLeft="1px solid #e0e0e0"
                        borderRight="1px solid #e0e0e0"
                      >
                        Actions
                      </Th>
                    </Tr>
                  );
                })}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <Tr
                      className="relative hover:bg-gray-100 cursor-pointer text-base lg:text-base"
                      {...row.getRowProps()}
                    >
                      {row.cells.map((cell) => {
                        return (
                          <Td
                            fontWeight="600"
                            padding="16px"
                            {...cell.getCellProps()}
                          >
                            {cell.column.id !== "leadtype" &&
                              cell.column.id !== "status" &&
                              cell.column.id !== "created_on" &&
                              cell.render("Cell")}

                            {/* Lead Type Rendering */}
                            {cell.column.id === "leadtype" && (
                              <span
                                className={`text-sm rounded-md px-3 py-1 ${row.original.leadtype === "People"
                                  ? "bg-[#fff0f6] text-[#c41d7f]"
                                  : "bg-[#e6f4ff] text-[#0958d9]"
                                  }`}
                              >
                                {row.original.leadtype === "People"
                                  ? "Individual"
                                  : "Corporate"}
                              </span>
                            )}

                            {/* Date Handling */}
                            {cell.column.id === "created_on" &&
                              row.original?.createdAt && (
                                <span>
                                  {moment(row.original?.createdAt).format(
                                    "DD/MM/YYYY"
                                  )}
                                </span>
                              )}

                            {/* Status Rendering */}
                            {cell.column.id === "status" && (
                              <span
                                className="text-sm rounded-md px-3 py-1"
                                style={{
                                  backgroundColor:
                                    statusStyles[
                                      row.original.status.toLowerCase()
                                    ]?.bg,
                                  color:
                                    statusStyles[
                                      row.original.status.toLowerCase()
                                    ]?.text,
                                }}
                              >
                                {row.original.status}
                              </span>
                            )}
                          </Td>
                        );
                      })}

                      {/* Actions */}
                      <Td className="flex gap-x-2">
                        <button onClick={() => dispatch(openKYCDrawer())}>
                          <FaUserShield size={20}
                            onClick={() => {
                               setDataId(row.original?._id);
                               dispatch(openKYCDrawer());
                            }} 
                            className="flex items-center justify-center text-blue-500" />
                        </button>
          
                        <button className="flex items-center justify-center text-blue-500" >

                          <MdEditSquare />

                        </button>


                        <button
                          className={`text-white px-3 py-1 rounded-full text-sm font-semibold transition-colors ${row.original?.status === "Completed"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                            }`}
                          onClick={() => openCompletionModal(row.original?._id)}
                          disabled={row.original?.status === "Completed"}
                        >
                          {row.original?.status === "Completed"
                            ? "Completed"
                            : "Mark as Completed"}
                        </button>

                        {row.original?.status === "Completed" && (
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold transition-colors flex items-center gap-1"
                            onClick={() =>
                              downloadRIFile(
                                row.original?._id,
                                row.original?.name ||
                                row.original?.people?.firstname ||
                                row.original?.company?.companyname ||
                                "Lead"
                              )
                            }
                            title="Download RI File"
                          >
                            <FaDownload />
                          </button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          <div className="w-[max-content] m-auto mt-4 mb-6">
            <button
              className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
              disabled={!canPreviousPage}
              onClick={previousPage}
            >
              Prev
            </button>
            <span className="mx-3 text-sm md:text-lg lg:text-xl xl:text-base">
              {pageIndex + 1} of {pageCount}
            </span>
            <button
              className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
              disabled={!canNextPage}
              onClick={nextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* RI Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload RI Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Select RI File</FormLabel>
              <Input
                type="file"
                accept=".xlsx, .xls, .csv, .pdf, .doc, .docx"
                onChange={handleFileUpload}
                border="1px dashed #ccc"
                p={2}
              />
              {riFile && (
                <Text fontSize="sm" color="green.500" mt={2}>
                  Selected: {riFile.name}
                </Text>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={markAsCompleted}
              isLoading={uploading}
              loadingText="Uploading & Completing..."
              disabled={!riFile}
            >
              Complete Demo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {kycDrawerIsOpened && (
        <ClickMenu
          top={0}
          right={0}
          closeContextMenuHandler={() => dispatch(closeKYCDrawer())}
        >
          <KYCDrawer
            closeDrawerHandler={() => dispatch(closeKYCDrawer())}
            dataId={dataId}
          />
        </ClickMenu>
      )}
    </Box>
  );
};

export default Demo;
