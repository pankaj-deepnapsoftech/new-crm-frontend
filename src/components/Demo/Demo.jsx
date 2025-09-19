import React, { useEffect, useState } from "react";
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
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import {
  MdContactPhone,
  MdOutlineVisibility,
  MdEdit,
  MdDeleteOutline,
} from "react-icons/md";
import { FaArrowsAlt } from "react-icons/fa";
import { useTable, useSortBy, usePagination } from "react-table";
import { useCookies } from "react-cookie";
import moment from "moment";
import { useDispatch } from "react-redux";
import { openMoveToDemoDrawer } from "../../redux/reducers/misc";

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
  const [dataId, setDataId] = useState();
  const [completingLeadId, setCompletingLeadId] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [riFile, setRiFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const statusStyles = {
    "scheduled demo": {
      bg: "#e6f7ff",
      text: "#1890ff",
    },
    completed: {
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

  const markAsCompleted = async () => {
    if (!riFile) {
      alert("Please select an RI file before completing the demo.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("leadId", selectedLeadId);
      formData.append("riFile", riFile);

      const response = await fetch(`${baseURL}lead/complete-demo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        fetchScheduledDemoLeads();
        onClose();
        alert("Demo marked as completed successfully!");
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
        const scheduledDemoLeads = data.leads.filter(
          (lead) =>
            lead.status === "Scheduled Demo" || lead.status === "Completed"
        );

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
    fetchScheduledDemoLeads();
  }, []);

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

  console.log(page);

  return (
    <Box p={6}>
      <div className="flex justify-between items-center mb-4">
        <Heading size="md" mb={4}>
          Scheduled Demos
        </Heading>
        <button
          className="border border-blue-700 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-700 hover:text-white transition-colors"
          onClick={fetchScheduledDemoLeads}
        >
          Refresh
        </button>
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
                                className={`text-sm rounded-md px-3 py-1 ${
                                  row.original.leadtype === "People"
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
                        <button
                          className={`text-white px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                            row.original?.status === "Completed"
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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                border="1px dashed #ccc"
                p={2}
              />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
              </Text>
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
              loadingText="Uploading..."
              disabled={!riFile}
            >
              Complete Demo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Demo;
