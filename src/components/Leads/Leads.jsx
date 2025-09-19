import {
  Badge,
  Box,
  Button,
  Checkbox,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import {
  MdOutlineRefresh,
  MdArrowBack,
  MdEdit,
  MdDeleteOutline,
  MdOutlineVisibility,
  MdContactPhone,
  MdDelete,
  MdAssignmentInd,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddLeadsDrawer,
  closeEditLeadsDrawer,
  closeSendSMSDrawer,
  closeShowBulkAssignDrawer,
  closeShowDetailsLeadsDrawer,
  closeShowChatDrawer,
  openAddLeadsDrawer,
  openEditLeadsDrawer,
  openSendSMSDrawer,
  openShowBulkAssignDrawer,
  openShowDetailsLeadsDrawer,
  openShowChatDrawer,
  openKYCDrawer,
  closeKYCDrawer,
  openMoveToDemoDrawer,
  closeMoveToDemoDrawer,
} from "../../redux/reducers/misc";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../ui/Loading";
import { FcDatabase } from "react-icons/fc";
import {
  FaArrowsAlt,
  FaCaretDown,
  FaCaretUp,
  FaFileCsv,
  FaSms,
  FaUserShield,
  FaWhatsapp,
} from "react-icons/fa";
import axios from "axios";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { usePagination, useSortBy, useTable } from "react-table";
import ClickMenu from "../ui/ClickMenu";
import LeadEditDrawer from "../ui/Drawers/Edit Drawers/LeadEditDrawer";
import LeadsDetailsDrawer from "../ui/Drawers/Details Drawers/LeadsDetailsDrawer";
import Chatdrawer from "../ui/Drawers/Chat/Chatdrawer";
import LeadsDrawer from "../ui/Drawers/Add Drawers/LeadsDrawer";
import KYCDrawer from "../ui/Drawers/KYC/KYCDrawer";
import MoveToDemo from "../ui/Drawers/Edit Drawers/MoveToDemo";
import moment from "moment";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import { json, Link, useLocation } from "react-router-dom";
import { checkAccess } from "../../utils/checkAccess";
import { IoLogoWhatsapp } from "react-icons/io";
import sampleCSV from "../../assets/bulk-upload-sample.csv";
import SMSDrawer from "../ui/Drawers/Add Drawers/SMSDrawer";
import BulkAssignDrawer from "../ui/Drawers/Add Drawers/BulkAssignDrawer";
import PieChart from "../ui/Charts/PieChart";

const columns = [
  {
    Header: "",
    accessor: "select",
  },
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
    Header: "Assigned",
    accessor: "assigned",
  },
  {
    Header: "Source",
    accessor: "source",
  },
  {
    Header: "Follow-up Date",
    accessor: "followup_date",
  },
  {
    Header: "Follow-up Reason",
    accessor: "followup_reason",
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
    Header: "Location",
    accessor: "location",
  },
  {
    Header: "PRC QT",
    accessor: "prc_qt",
  },
  {
    Header: "Lead Category",
    accessor: "leadCategory",
  },
    {
      Header: "Demo File",
      accessor: "demoPdf",
      Cell: ({ row }) => (
        row.original.demoPdf ? (
          <a
            href={row.original.demoPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View File
          </a>
        ) : (
          <span>No File</span>
        )
      ),
    },
];

const Leads = () => {
  const [cookies] = useCookies();
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(true);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [leadSummaryData, setLeadSummaryData] = useState([]);
  const [leadSummaryLabels, setLeadSummaryLabels] = useState([]);
  const [leadSummaryBG, setLeadSummaryBG] = useState([]);

  const [isAllSelected, setIsAllSelected] = useState(false);

  const dispatch = useDispatch();
  const location = useLocation();

  const [leadDeleteId, setLeadDeleteId] = useState();
  const [deleteAll, setDeleteAll] = useState(false);
  const [dataInfo, setDataInfo] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [toggleBulkUpload, setToggleBulkUpload] = useState(false);
  const csvRef = useRef();

  const [bulkSMSMobiles, setBulkSMSMobiles] = useState([]);
  const [components, setComponents] = useState([{ type: "text", text: "" }]);
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateLang, setTemplateLang] = useState("en");
  const [bulkName, setBulkName] = useState([]);

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
      data: filteredData,
      initialState: { pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  const {
    addLeadsDrawerIsOpened,
    editLeadsDrawerIsOpened,
    showDetailsLeadsDrawerIsOpened,
    showChatDrawerIsOpened,
    sendSMSDrawerIsOpened,
    showBulkAssignDrawerIsOpened,
    kycDrawerIsOpened,
    moveToDemoDrawerIsOpened,
  } = useSelector((state) => state.misc);

  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "lead");

  const statusStyles = {
    draft: {
      bg: "#ffffff",
      text: "black",
    },
    new: {
      bg: "#e6f4ff",
      text: "#0958d9",
    },
    "in negotiation": {
      bg: "#f9f0ff",
      text: "#531dab",
    },
    completed: {
      bg: "#f6ffed",
      text: "#389e0d",
    },
    loose: {
      bg: "#fff1f0",
      text: "#cf1322",
    },
    cancelled: {
      bg: "#dd153d",
      text: "#f1ecff",
    },
    assigned: {
      bg: "#48d1cc",
      text: "#f9f0ff",
    },
    "on hold": {
      bg: "#deb887",
      text: "#ffffff",
    },
    "follow up": {
      bg: "#db95ff",
      text: "#ffffff",
    },
  };

  const sourceStyles = {
    linkedin: {
      bg: "rgb(65, 105, 225)",
      text: "#fff",
    },
    "social media": {
      bg: "rgb(135, 206, 235)",
      text: "#fff",
    },
    website: {
      bg: "rgb(255, 127, 80)",
      text: "#fff",
    },
    advertising: {
      bg: "rgb(0, 100, 0)",
      text: "#fff",
    },
    friend: {
      bg: "rgb(178, 34, 34)",
      text: "#fff",
    },
    "professionals network": {
      bg: "rgb(199, 21, 133)",
      text: "#fff",
    },
    "customer referral": {
      bg: "rgb(238, 130, 238)",
      text: "#fff",
    },
    sales: {
      bg: "rgb(255, 20, 147)",
      text: "#fff",
    },
    "digital marketing": {
      bg: "rgb(255, 20, 147)",
      text: "#fff",
    },
    upwork: {
      bg: "#636e72",
      text: "#fff",
    },
    gem: {
      bg: "#fdcb6e",
      text: "#fff",
    },
    freelancer: {
      bg: "#ff7675",
      text: "#fff",
    },
    indiamart: {
      bg: "#e17055",
      text: "#fff",
    },
    fiverr: {
      bg: "#00b894",
      text: "#fff",
    },
  };

  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const fetchAllLeads = async () => {
    setSearchKey("");
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const response = await fetch(baseURL + "lead/all-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const newData = data.leads.filter(
        (lead) =>
          lead.dataBank !== true &&
          lead?.status !== "Scheduled Demo" &&
          lead?.status !== "Completed"
      );

      setData(newData);
      setFilteredData(data.leads); // If you want to filter this too, apply same filter
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };


  const fetchLeadSummary = async () => {
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const response = await fetch(baseURL + "lead/lead-summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setLeadSummaryBG([
        "#F57D6A",
        "#F8D76A",
        "#54CA21",
        "#21CAC1",
        "#2170CA",
        "#C439EB",
        "#C7C7C7",
        "#F35C9D",
        "#55DCB8",
      ]);

      const labels = Object.keys(data.leads[0].statusCount).map((status) => {
        return `${status} ${(
          (data.leads[0].statusCount[status] / data.leads[0].totalCount) *
          100
        ).toFixed(2)}%`;
      });

      setLeadSummaryLabels(labels);
      setLeadSummaryData(Object.values(data.leads[0].statusCount));
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  const bulkUploadHandler = async (e) => {
    e.preventDefault();

    try {
      setBulkUploading(true);
      if (csvRef.current.files.length === 0) {
        toast.error("CSV file not selected");
        return;
      }

      const formData = new FormData();
      formData.append("excel", csvRef.current.files[0]);

      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "lead/bulk-upload", {
        method: "POST",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      fetchAllLeads();
      setToggleBulkUpload(false);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBulkUploading(false);
    }
  };

  const selectAllHandler = () => {
    const select = !isAllSelected;
    setIsAllSelected(select);
    const rows = Array.from(document.getElementsByName("select")).slice(
      pageIndex * pageSize,
      pageIndex * pageSize + pageSize
    );
    rows.forEach((e) => {
      e.checked = select;
    });

    if (select) {
      const reqData = filteredData.slice(
        pageIndex * pageSize,
        pageIndex * pageSize + pageSize
      );
      const bulkSMSMobilesArr = reqData.map((data) => data.phone);
      setBulkSMSMobiles((prev) => [...prev, ...bulkSMSMobilesArr]);

      const bulkSMSNameArr = reqData.map((data) => data.name);
      setBulkName((prev) => [...prev, ...bulkSMSNameArr]);

      const selectedUsersArr = reqData.map(({ phone, name }) => ({
        phone,
        name,
      }));

      setSelectedUsers((prevSelected) => [
        ...prevSelected,
        ...selectedUsersArr,
      ]);
    } else {
      const reqData = filteredData.slice(
        pageIndex * pageSize,
        pageIndex * pageSize + pageSize
      );
      const deselectedPhones = reqData.map((data) => data.phone);
      setBulkSMSMobiles((prev) =>
        prev.filter((mobile) => !deselectedPhones.includes(mobile))
      );
      setBulkName((prev) =>
        prev.filter(
          (userName) => !reqData.some((data) => data.name === userName)
        )
      );

      setSelectedUsers((prevSelected) =>
        prevSelected.filter((user) => !deselectedPhones.includes(user.phone))
      );
    }
  };

  const selectOneHandler = (e, phone, name) => {
    if (e.target.checked) {
      setBulkSMSMobiles((prev) => [...prev, phone]);
      setSelectedUsers((prevSelected) => [...prevSelected, { phone, name }]);
      setBulkName((prev) => [...prev, name]);
    } else {
      setBulkSMSMobiles((prev) => prev.filter((mobile) => mobile !== phone));
      setBulkName((prev) => prev.filter((userName) => userName !== name));
      setSelectedUsers((prevSelected) =>
        prevSelected.filter((user) => user.phone !== phone)
      );
    }
  };

  const bulkAssignHandler = async (e) => {
    const rows = document.getElementsByName("select");
    const selectedRows = Array.from(rows).filter((e) => e.checked);
    if (selectedRows.length === 0) {
      toast.error("No lead selected");
      return;
    }
    const selectedRowIds = selectedRows.map((e) => e.value);
    setSelected(selectedRowIds);

    dispatch(openShowBulkAssignDrawer());
  };

  const bulkDownloadHandler = async (e) => {
    fetch(baseURL + "lead/bulk-download", {
      method: "GET",
      headers: {
        authorization: `Bearer ${cookies?.access_token}`,
      },
    })
      .then((response) => {
        const filename = response.headers
          .get("content-disposition")
          .split("filename=")[1]
          .replace(/"/g, "");
        return response.blob().then((blob) => ({ filename, blob }));
      })
      .then(({ filename, blob }) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        a.remove();
      })
      .catch((err) => {
        toast.error(err?.message || "Something went wrong");
      });
  };

  const addLeadsHandler = () => {
    dispatch(openAddLeadsDrawer());
  };

  const kycHandler = () => {
    dispatch(openKYCDrawer());
  };

  const confirmDeleteHandler = async () => {
    onOpen();
  };

  const deleteAllHandler = async () => {
    try {
      const response = await fetch(baseURL + "lead/delete-all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      onClose();
      fetchAllLeads();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteHandler = async () => {
    if (!leadDeleteId) {
      return;
    }

    try {
      const response = await fetch(baseURL + "lead/delete-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          leadId: leadDeleteId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      onClose();
      fetchAllLeads();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editHandler = (id) => {
    setDataId(id);
    dispatch(openEditLeadsDrawer());
  };

  const showDetailsHandler = (id) => {
    setDataId(id);
    dispatch(openShowDetailsLeadsDrawer());
  };

  const showChatsHandler = (id) => {
    setDataId(id);
    dispatch(openShowChatDrawer());
  };

  useEffect(() => {
    if (isAllowed) {
      fetchAllLeads();
    }
  }, []);

  useEffect(() => {
    if (location?.state?.searchKey) {
      setSearchKey(location?.state?.searchKey);
    }
  }, []);

  //lead category count
  const calculateLeadCounts = (filteredData) => {
    const counts = {
      hot: 0,
      warm: 0,
      cold: 0,
    };

    // Count the number of leads in each category
    filteredData.forEach((lead) => {
      if (lead.leadCategory === "Hot") {
        counts.hot++;
      } else if (lead.leadCategory === "Warm") {
        counts.warm++;
      } else if (lead.leadCategory === "Cold") {
        counts.cold++;
      }
    });

    return counts;
  };

  const [leadCounts, setLeadCounts] = useState({
    hot: 0,
    warm: 0,
    cold: 0,
  });

  useEffect(() => {
    // Calculate lead counts when filteredData changes
    const counts = calculateLeadCounts(filteredData);
    setLeadCounts(counts);
  }, [filteredData]);

  const chartData = {
    labels: ["Hot", "Warm", "Cold"],
    data: [leadCounts.hot, leadCounts.warm, leadCounts.cold],
    ChartColors: ["#F57D6A", "#F8D76A", "#54CA21"],
  };

  // filter by status
 
  const calculateLeadStatus = (filteredData) => {
    const counts = {
      FollowUp: 0,
      OnHold: 0,
      Cancelled: 0,
      New: 0,
    };

    filteredData.forEach((lead) => {
      if (lead?.status === "Follow Up") {
        counts.FollowUp++;
      } else if (lead?.status === "On Hold") {
        counts.OnHold++;
      } else if (lead?.status === "Cancelled") {
        counts.Cancelled++;
      } else if (lead?.status === "New") {
        counts.New++;
      }
    });

    return counts;
  };

  const [statusCounts, setStatusCounts] = useState({
    FollowUp: 0,
    OnHold: 0,
    Cancelled: 0,
    New: 0,
  });

  //source graph data
  const calculateLeadSource = (filteredData) => {
    const counts = {
      Linkedin: 0,
      SocialMedia: 0,
      Website: 0,
      Advertising: 0,
      Friend: 0,
      ProfessionalsNetwork: 0,
      CustomerReferral: 0,
      Sales: 0,
      DigitalMarketing: 0,
      Upwork: 0,
      Gem: 0,
      Freelancer: 0,
    };

    filteredData.forEach((lead) => {
      switch (lead?.source) {
        case "Linkedin":
          counts.Linkedin++;
          break;
        case "Social Media":
          counts.SocialMedia++;
          break;
        case "Website":
          counts.Website++;
          break;
        case "Advertising":
          counts.Advertising++;
          break;
        case "Friend":
          counts.Friend++;
          break;
        case "Professionals Network":
          counts.ProfessionalsNetwork++;
          break;
        case "Customer Referral":
          counts.CustomerReferral++;
          break;
        case "Sales":
          counts.Sales++;
          break;
        case "Digital Marketing":
          counts.DigitalMarketing++;
          break;
        case "Upwork":
          counts.Upwork++;
          break;
        case "Gem":
          counts.Gem++;
          break;
        case "Freelancer":
          counts.Freelancer++;
          break;
        case "Linkedin":
          counts.Linkedin++;
          break;
        default:
          // Handle the case where status does not match any of the above
          break;
      }
    });

    return counts;
  };

  const [sourceCounts, setSourceCounts] = useState({
    Linkedin: 0,
    SocialMedia: 0,
    Website: 0,
    Advertising: 0,
    Friend: 0,
    ProfessionalsNetwork: 0,
    CustomerReferral: 0,
    Sales: 0,
    DigitalMarketing: 0,
    Upwork: 0,
    Gem: 0,
    Freelancer: 0,
  });

  useEffect(() => {
    // Calculate lead counts when filteredData changes
    const counts = calculateLeadStatus(filteredData);
    setStatusCounts(counts);

    const sources = calculateLeadSource(filteredData);
    setSourceCounts(sources);
  }, [filteredData]);

  const statusChartData = {
    labels: ["Follow Up", "On Hold", "Cancelled", "New"],
    data: [
      statusCounts.FollowUp,
      statusCounts.OnHold,
      statusCounts.Cancelled,
      statusCounts.New,
    ],
    ChartColors: [
      "#F57D6A",
      "#F8D76A",
      "#54CA21",
      "#21CAC1",
      "#2170CA",
      "#C439EB",
      "#C7C7C7",
      "#F35C9D",
      "#55DCB8",
    ],
  };

  const sourceChartData = {
    labels: [
      "Linkedin",
      "Social Media",
      "Website",
      "Advertising",
      "Friend",
      "Professionals Network",
      "Customer Referral",
      "Sales",
      "DigitalMarketing",
      "Upwork",
      "Gem",
      "Freelancer",
    ],
    data: [
      sourceCounts.Linkedin,
      sourceCounts.SocialMedia,
      sourceCounts.Website,
      sourceCounts.Advertising,
      sourceCounts.Friend,
      sourceCounts.ProfessionalsNetwork,
      sourceCounts.CustomerReferral,
      sourceCounts.Sales,
      sourceCounts.DigitalMarketing,
      sourceCounts.Upwork,
      sourceCounts.Gem,
      sourceCounts.Freelancer,
    ],
    ChartColors: [
      "#F57D6A",
      "#F8D76A",
      "#54CA21",
      "#21CAC1",
      "#2170CA",
      "#C439EB",
      "#C7C7C7",
      "#F35C9D",
      "#55DCB8",
      "#B53471",
      "#5758BB",
      "#EE5A24",
    ],
  };

  useEffect(() => {
    setBulkSMSMobiles([]);
    setIsAllSelected(false);

    let searchedData = data;

    // Apply search key filter
    if (searchKey.trim() !== "") {
      searchedData = data.filter(
        (d) =>
          (d?.leadtype === "People"
            ? "individual".includes(searchKey.toLowerCase())
            : "corporate".includes(searchKey.toLowerCase())) ||
          d?.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.source?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.status?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.assigned?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.leadCategory?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.phone?.includes(searchKey) ||
          d?.followup_reason?.toLowerCase()?.includes(searchKey) ||
          d?.creator?.toLowerCase()?.includes(searchKey) ||
          (d?.followup_date &&
            new Date(d?.followup_date)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchKey.replaceAll("/", ""))) ||
          (d?.createdAt &&
            new Date(d?.createdAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchKey.replaceAll("/", ""))) ||
          d?.email?.toLowerCase().includes(searchKey.toLowerCase())
      );
    }

    if (startDate || endDate) {
      searchedData = searchedData.filter((d) => {
        const date = new Date(d?.createdAt);
        const formattedDate = date.toISOString().substring(0, 10);

        const isAfterStartDate = startDate ? formattedDate >= startDate : true;
        const isBeforeEndDate = endDate ? formattedDate <= endDate : true;

        return isAfterStartDate && isBeforeEndDate;
      });
    }

    setFilteredData(searchedData);
  }, [searchKey, data, startDate, endDate]);

  useEffect(() => {
    setIsAllSelected(false);
    setBulkSMSMobiles([]);
  }, [pageIndex]);

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

  const handleSelection = (e, id, phone, name) => {
    if (e.target.checked) {
      setDataInfo([...dataInfo, id]);
      // setSelectedUsers([...selectedUsers, { phone, name }]);
    } else {
      const filter = dataInfo.filter((item) => item !== id);
      setDataInfo(filter);
      // setSelectedUsers([]);
    }
  };

  const addtoDataBank = async () => {
    setLoading(true);
    try {
      const response = await fetch(baseURL + "lead/data/bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({ dataInfo, dataBank: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      fetchAllLeads();
      toast.success("Data added successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to add data");
    } finally {
      setLoading(false);
    }
  };

  const [selectedGraph, setSelectedGraph] = useState("PieChart");

  const handleGraphChange = (e) => {
    setSelectedGraph(e.target.value);
  };

  // Function to calculate KYC progress percentage
  const calculateKYCProgress = () => {
    if (!filteredData || filteredData.length === 0) {
      return 0;
    }

    const totalFields = 10; // Total number of KYC fields
    let totalFilledFields = 0;

    filteredData.forEach((lead) => {
      let filledFields = 0;

      // Check if name exists (from people or company)
      if (lead.name && lead.name.trim() !== "") {
        filledFields++;
      }

      // Check if phone exists
      if (lead.phone && lead.phone.trim() !== "") {
        filledFields++;
      }

      // Check if email exists
      if (lead.email && lead.email.trim() !== "") {
        filledFields++;
      }

      // Check if status exists
      if (lead.status && lead.status.trim() !== "") {
        filledFields++;
      }

      // Check if source exists
      if (lead.source && lead.source.trim() !== "") {
        filledFields++;
      }

      // Check if assigned exists
      if (lead.assigned && lead.assigned.trim() !== "") {
        filledFields++;
      }

      // Check if notes exists
      if (lead.notes && lead.notes.trim() !== "") {
        filledFields++;
      }

      // Check if PRC QT exists
      if (lead.prc_qt && lead.prc_qt.trim() !== "") {
        filledFields++;
      }

      // Check if location exists
      if (lead.location && lead.location.trim() !== "") {
        filledFields++;
      }

      // Check if lead category exists
      if (lead.leadCategory && lead.leadCategory.trim() !== "") {
        filledFields++;
      }

      totalFilledFields += filledFields;
    });

    // Calculate average percentage across all leads
    const averagePercentage = Math.round(
      (totalFilledFields / (filteredData.length * totalFields)) * 100
    );
    return averagePercentage;
  };

  const whatsappHandler = async (e) => {
    e.preventDefault();
    //  console.log(selectedUsers);
    if (selectedUsers.length === 0) {
      toast.error("Please select users first!");
    } else {
      setComponents([{ type: "text", text: "" }]);
      setTemplateName("");
      setTemplateLang("en");
      setOpen(true);
    }
  };
  const handleComponentChange = (index, value) => {
    setComponents((prevComponents) =>
      prevComponents.map((component, i) =>
        i === index ? { ...component, text: value } : component
      )
    );
  };

  const addComponent = () => {
    setComponents((prevComponents) => [
      ...prevComponents,
      { type: "text", text: "" },
    ]);
  };

  const sendMessages = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      for (const data of selectedUsers) {
        const finalComponents = components.map((comp, index) =>
          index === 0 ? { type: "text", text: data.name } : comp.text && comp
        );
        const payload = {
          phone: data.phone.trim(),
          template_name: templateName,
          template_lang: templateLang,
          components: finalComponents,
        };

        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}send-builk-Whatsapp/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );
      }

      toast.success("Messages sent successfully!");
    } catch (error) {
      console.log(error);
      toast.error(`Error while sending message: ${error}`);
    } finally {
      // Uncheck all checkboxes
      const checkboxes = document.querySelectorAll('input[name="select"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // Reset states
      setSelectedUsers([]);
      setIsAllSelected(false);
      setOpen(false);
      setLoading(false);
    }
  };
  
  return (
    <>
      {!isAllowed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-[#ff6f6f] flex gap-x-2">
          {msg}
          {((auth?.isSubscribed && auth?.isSubscriptionEnded) ||
            (auth?.isTrial && auth?.isTrialEnded)) && (
            <div className="-mt-1">
              <Link to="/pricing">
                <button className="text-base border border-[#d61616] rounded-md px-5 py-1 bg-[#d61616] text-white font-medium hover:bg-white hover:text-[#d61616] ease-in-out duration-300">
                  Pay Now
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {isAllowed && (
        <div>
          <>
            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    {!deleteAll && leadDeleteId && <span>Delete Lead</span>}
                    {deleteAll && !leadDeleteId && (
                      <span>Delete All Leads</span>
                    )}
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure, deleting a Lead will also delete its
                    corresponding Offers?
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    {!deleteAll && leadDeleteId && (
                      <Button colorScheme="red" onClick={deleteHandler} ml={3}>
                        Delete Lead
                      </Button>
                    )}
                    {deleteAll && !leadDeleteId && (
                      <Button
                        colorScheme="red"
                        onClick={deleteAllHandler}
                        ml={3}
                      >
                        Delete All
                      </Button>
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
          <div>
            <div className="flex flex-col items-start justify-start gap-y-1 md:justify-between mb-4  pb-2 z-10">
              <div className="w-full flex text-lg lg:text-xl justify-between font-semibold lg:items-center gap-y-1 mb-2">
                {/* <span className="mr-2">
                  <MdArrowBack />
                </span> */}
                <div>Lead List</div>
                <div className="flex gap-x-2">
                  <textarea
                    className="rounded-[10px] w-full md:flex-1 px-2 py-2 md:px-3 md:py-2 text-sm focus:outline-[#1640d6] hover:outline:[#1640d6] border resize-none"
                    rows="1"
                    width="220px"
                    placeholder="Search"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                  />
                  <Button
                    fontSize={{ base: "14px", md: "14px" }}
                    paddingX={{ base: "10px", md: "12px" }}
                    paddingY={{ base: "0", md: "3px" }}
                    width={{ base: "-webkit-fill-available", md: 100 }}
                    onClick={() => {
                      fetchAllLeads();
                      fetchLeadSummary();
                    }}
                    leftIcon={<MdOutlineRefresh />}
                    color="#1640d6"
                    borderColor="#1640d6"
                    variant="outline"
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap justify-start gap-y-2 gap-x-3 w-full">
                {/*  select all handler */}
                <Button
                  fontSize={{ base: "12px", md: "14px" }}
                  paddingX={{ base: "8px", md: "12px" }}
                  paddingY={{ base: "2px", md: "3px" }}
                  width={{ base: "100%", md: 130 }}
                  onClick={selectAllHandler}
                  color="#ffffff"
                  backgroundColor="#1640d6"
                  borderColor="#1640d6"
                >
                  {isAllSelected ? "Unselect All" : "Select All"}
                </Button>
                <Button
                  fontSize={{ base: "12px", md: "14px" }}
                  paddingX={{ base: "8px", md: "12px" }}
                  paddingY={{ base: "2px", md: "3px" }}
                  width={{ base: "100%", md: 130 }}
                  onClick={() => {
                    dispatch(openSendSMSDrawer());
                  }}
                  rightIcon={<FaSms size={28} />}
                  color="#ffffff"
                  backgroundColor="#1640d6"
                  borderColor="#1640d6"
                >
                  Bulk SMS
                </Button>
                <Button
                  fontSize={{ base: "12px", md: "14px" }}
                  paddingX={{ base: "8px", md: "12px" }}
                  paddingY={{ base: "2px", md: "3px" }}
                  width={{ base: "100%", md: 130 }}
                  onClick={() => {
                    bulkAssignHandler();
                  }}
                  rightIcon={<MdAssignmentInd size={28} />}
                  color="#ffffff"
                  backgroundColor="#1640d6"
                  borderColor="#1640d6"
                >
                  Bulk Assign
                </Button>
                {role === "Super Admin" && (
                  <Button
                    fontSize={{ base: "12px", md: "14px" }}
                    paddingX={{ base: "8px", md: "12px" }}
                    paddingY={{ base: "2px", md: "3px" }}
                    width={{ base: "100%", md: 150 }}
                    onClick={() => {
                      bulkDownloadHandler();
                    }}
                    rightIcon={<FaFileCsv size={28} />}
                    color="#ffffff"
                    backgroundColor="#1640d6"
                    borderColor="#1640d6"
                  >
                    Bulk Download
                  </Button>
                )}
                <div className="w-full md:w-auto">
                  <Button
                    fontSize={{ base: "12px", md: "14px" }}
                    paddingX={{ base: "8px", md: "12px" }}
                    paddingY={{ base: "2px", md: "3px" }}
                    width={{ base: "100%", md: 200 }}
                    color="white"
                    backgroundColor="#1640d6"
                    rightIcon={<FaFileCsv size={28} />}
                    onClick={() => setToggleBulkUpload((prev) => !prev)}
                  >
                    Bulk Upload
                  </Button>
                  {toggleBulkUpload && (
                    <>
                      <div className="mt-2">
                        <a href={sampleCSV}>
                          <Button
                            fontSize={{ base: "12px", md: "14px" }}
                            paddingX={{ base: "8px", md: "12px" }}
                            paddingY={{ base: "2px", md: "3px" }}
                            width={{ base: "100%", md: 200 }}
                            color="#1640d6"
                            borderColor="#1640d6"
                            variant="outline"
                          >
                            Download Sample CSV
                          </Button>
                        </a>
                      </div>
                      <div className="mt-2">
                        <form onSubmit={bulkUploadHandler}>
                          <input
                            ref={csvRef}
                            className="mr-1 p-1 rounded-md outline-none border border-[#8B8B8B] w-full md:w-60"
                            type="file"
                            accept=".csv"
                          />
                          <Button
                            isDisabled={bulkUploading}
                            isLoading={bulkUploading}
                            fontSize={{ base: "12px", md: "14px" }}
                            paddingX={{ base: "8px", md: "12px" }}
                            paddingY={{ base: "2px", md: "3px" }}
                            width={{ base: "100%", md: 100 }}
                            color="white"
                            backgroundColor="#1640d6"
                            type="submit"
                          >
                            Upload
                          </Button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  fontSize={{ base: "12px", md: "14px" }}
                  paddingX={{ base: "8px", md: "12px" }}
                  paddingY={{ base: "2px", md: "3px" }}
                  width={{ base: "100%", md: 200 }}
                  onClick={whatsappHandler}
                  color="white"
                  rightIcon={<IoLogoWhatsapp size={28} />}
                  backgroundColor="#1640d6"
                >
                  Bulk Whatsapp
                </Button>
                <Button
                  fontSize={{ base: "12px", md: "14px" }}
                  paddingX={{ base: "8px", md: "12px" }}
                  paddingY={{ base: "2px", md: "3px" }}
                  width={{ base: "100%", md: 200 }}
                  onClick={addLeadsHandler}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New Lead
                </Button>
                <Button
                  fontSize={{ base: "12px", md: "14px" }}
                  paddingX={{ base: "8px", md: "12px" }}
                  paddingY={{ base: "2px", md: "3px" }}
                  width={{ base: "100%", md: 200 }}
                  color="white"
                  backgroundColor="#1640d6"
                  onClick={addtoDataBank}
                >
                  Add to data bank
                </Button>
               
                {/* {role === "Super Admin" && (
                  <Button
                    fontSize={{ base: "12px", md: "14px" }}
                    paddingX={{ base: "8px", md: "12px" }}
                    paddingY={{ base: "2px", md: "3px" }}
                    width={{ base: "100%", md: "auto" }}
                    onClick={() => {
                      setDeleteAll(true);
                      confirmDeleteHandler();
                    }}
                    color="white"
                    backgroundColor="#e34949"
                  >
                    <MdDelete size={28} />
                  </Button>
                )} */}
                <Select
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                  }}
                  value={pageSize} // Ensure this is controlled
                  width="80px"
                  className="mt-2 md:mt-0"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={100000}>All</option>
                </Select>

                <div className="flex items-center gap-x-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 border rounded-md"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border rounded-md"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            <div>
              {showChatDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeShowChatDrawer())
                  }
                >
                  <Chatdrawer
                    dataId={dataId}
                    closeDrawerHandler={() => dispatch(closeShowChatDrawer())}
                  />
                </ClickMenu>
              )}

              <HStack className="">
                {kycDrawerIsOpened && (
                  <ClickMenu
                    top={0}
                    right={0}
                    closeContextMenuHandler={() => dispatch(closeKYCDrawer())}
                  >
                    <KYCDrawer
                      closeDrawerHandler={() => dispatch(closeKYCDrawer())}
                      kycProgress={calculateKYCProgress()}
                      totalLeads={filteredData.length}
                      dataId={dataId} 
                    />
                  </ClickMenu>
                )}

                {moveToDemoDrawerIsOpened && (
                  <ClickMenu
                    top={0}
                    right={0}
                    closeContextMenuHandler={() =>
                      dispatch(closeMoveToDemoDrawer())
                    }
                  >
                    <MoveToDemo
                      dataId={dataId}
                      fetchAllLeads={fetchAllLeads}
                      closeDrawerHandler={() =>
                        dispatch(closeMoveToDemoDrawer())
                      }
                      leadData={data.find((lead) => lead._id === dataId)}
                    />
                  </ClickMenu>
                )}

                {showBulkAssignDrawerIsOpened && (
                  <ClickMenu
                    top={0}
                    right={0}
                    closeContextMenuHandler={() =>
                      dispatch(closeShowBulkAssignDrawer())
                    }
                  >
                    <BulkAssignDrawer
                      leads={selected}
                      fetchAllLeads={fetchAllLeads}
                      fetchLeadSummary={fetchLeadSummary}
                      closeDrawerHandler={() =>
                        dispatch(closeShowBulkAssignDrawer())
                      }
                      data={[]}
                    />
                  </ClickMenu>
                )}

                {sendSMSDrawerIsOpened && (
                  <ClickMenu
                    top={0}
                    right={0}
                    closeContextMenuHandler={() => {
                      dispatch(closeSendSMSDrawer());
                      setBulkSMSMobiles([]);
                      setBulkName([]);
                    }}
                  >
                    <SMSDrawer
                      fetchAllLeads={fetchAllLeads}
                      closeDrawerHandler={() => {
                        dispatch(closeSendSMSDrawer());
                        setBulkSMSMobiles([]);
                        setBulkName([]);
                      }}
                      mobiles={bulkSMSMobiles}
                      names={bulkName}
                    />
                  </ClickMenu>
                )}

                {addLeadsDrawerIsOpened && (
                  <ClickMenu
                    top={0}
                    right={0}
                    closeContextMenuHandler={() =>
                      dispatch(closeAddLeadsDrawer())
                    }
                  >
                    <LeadsDrawer
                      fetchLeadSummary={fetchLeadSummary}
                      fetchAllLeads={fetchAllLeads}
                      closeDrawerHandler={() => dispatch(closeAddLeadsDrawer())}
                    />
                  </ClickMenu>
                )}

                {editLeadsDrawerIsOpened && (
                  <ClickMenu
                    top={0}
                    right={0}
                    closeContextMenuHandler={() =>
                      dispatch(closeEditLeadsDrawer())
                    }
                  >
                    <LeadEditDrawer
                      dataId={dataId}
                      fetchAllLeads={fetchAllLeads}
                      closeDrawerHandler={() =>
                        dispatch(closeEditLeadsDrawer())
                      }
                    />
                  </ClickMenu>
                )}

                {showDetailsLeadsDrawerIsOpened && (
                  <ClickMenu
                    top={0}
                    right={0}
                    closeContextMenuHandler={() =>
                      dispatch(closeShowDetailsLeadsDrawer())
                    }
                  >
                    <LeadsDetailsDrawer
                      dataId={dataId}
                      closeDrawerHandler={() =>
                        dispatch(closeShowDetailsLeadsDrawer())
                      }
                    />
                  </ClickMenu>
                )}
              </HStack>

              {loading && (
                <div>
                  <Loading />
                </div>
              )}
              {!loading && filteredData.length === 0 && (
                <div className="flex items-center justify-center flex-col">
                  <FcDatabase color="red" size={80} />
                  <span className="mt-1 font-semibold text-2xl">No Data</span>
                </div>
              )}
              {!loading && filteredData.length > 0 && (
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
                                    className={`${
                                      column.id === "name"
                                        ? "sticky top-0 left-[-2px]"
                                        : ""
                                    }`}
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
                                    className={
                                      cell.column.id === "name"
                                        ? "sticky left-0 bg-gray-50 hover:bg-gray-100"
                                        : ""
                                    }
                                    fontWeight="600"
                                    padding="16px"
                                    {...cell.getCellProps()}
                                  >
                                    {cell.column.id !== "select" &&
                                      cell.column.id !== "leadtype" &&
                                      cell.column.id !== "status" &&
                                      cell.column.id !== "source" &&
                                      cell.column.id !== "assigned" &&
                                      cell.column.id !== "followup_date" &&
                                      cell.column.id !== "followup_reason" &&
                                      cell.column.id !== "created_on" &&
                                      cell.column.id !== "leadCategory" &&
                                      cell.render("Cell")}

                                    {cell.column.id === "select" && (
                                      <input
                                        value={cell.row.original._id}
                                        name="select"
                                        type="checkbox"
                                        onChange={(e) => {
                                          selectOneHandler(
                                            e,
                                            cell.row.original.phone,
                                            cell.row.original.name
                                          );
                                          handleSelection(
                                            e,
                                            e.target.value,
                                            cell.row.original.phone,
                                            cell.row.original.name
                                          );
                                        }}
                                      />
                                    )}

                                    {/* Specific Column Renderings */}
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

                                    {/* Date & Reason Handling */}
                                    {cell.column.id === "created_on" &&
                                      row.original?.createdAt && (
                                        <span>
                                          {moment(
                                            row.original?.createdAt
                                          ).format("DD/MM/YYYY")}
                                        </span>
                                      )}
                                    {cell.column.id === "followup_date" &&
                                      row.original?.followup_date && (
                                        <span>
                                          {moment(
                                            row.original?.followup_date
                                          ).format("DD/MM/YYYY")}
                                        </span>
                                      )}
                                    {cell.column.id === "followup_reason" &&
                                      row.original?.followup_reason && (
                                        <span>
                                          {row.original?.followup_reason?.substr(
                                            0,
                                            10
                                          )}
                                          ...
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

                                    {/* Source Rendering */}
                                    {cell.column.id === "source" && (
                                      <span
                                        className="text-sm rounded-md px-3 py-1"
                                        style={{
                                          backgroundColor:
                                            sourceStyles[
                                              row?.original?.source?.toLowerCase()
                                            ]?.bg,
                                          color:
                                            sourceStyles[
                                              row?.original?.source?.toLowerCase()
                                            ]?.text,
                                        }}
                                      >
                                        {row.original.source}
                                      </span>
                                    )}

                                    {/* Assigned */}
                                    {cell.column.id === "assigned" && (
                                      <span>
                                        {row.original?.assigned ||
                                          "Not Assigned"}
                                      </span>
                                    )}

                                    {cell.column.id === "leadCategory" && (
                                      <Badge
                                        className="text-sm rounded-md px-3 py-1"
                                        colorScheme={getCategoryColor(
                                          row.original?.leadCategory
                                        )}
                                      >
                                        {row.original?.leadCategory}
                                      </Badge>
                                    )}
                                  </Td>
                                );
                              })}

                              {/* Actions */}
                              <Td className="flex items-center gap-x-3">
                                {/* KYC Button */}
                               
                                  
                                
                                  <FaUserShield size={20}
                                    onClick={() => {
                                      setDataId(row.original?._id);
                                      dispatch(openKYCDrawer());
                                    }} className="flex items-center justify-center text-blue-500"  /> 
                             


                                {/* Schedule Demo */}
                                <FaArrowsAlt
                                  className="text-blue-500 hover:scale-110 transition-transform cursor-pointer"
                                  size={20}
                                  title="Schedule Demo"
                                  onClick={() => {
                                    setDataId(row.original?._id);
                                    dispatch(openMoveToDemoDrawer());
                                  }}
                                />

                                {/* Contact/Chat */}
                                <MdContactPhone
                                  className="text-blue-500 hover:scale-110 transition-transform cursor-pointer"
                                  size={20}
                                  title="Contact Customer"
                                  onClick={() =>
                                    showChatsHandler({
                                      id: row.original?._id,
                                      customer_name: row.original?.name,
                                    })
                                  }
                                />

                                {/* View Details */}
                                <MdOutlineVisibility
                                  className="text-blue-500 hover:scale-110 transition-transform cursor-pointer"
                                  size={20}
                                  title="View Details"
                                  onClick={() => showDetailsHandler(row.original?._id)}
                                />

                                {/* Edit */}
                                <MdEdit
                                  className="text-yellow-500 hover:scale-110 transition-transform cursor-pointer"
                                  size={20}
                                  title="Edit Lead"
                                  onClick={() => editHandler(row.original?._id)}
                                />

                                {/* Delete */}
                                <MdDeleteOutline
                                  className="text-red-500 hover:scale-110 transition-transform cursor-pointer"
                                  size={20}
                                  title="Delete Lead"
                                  onClick={() => {
                                    setLeadDeleteId(row.original?._id);
                                    confirmDeleteHandler();
                                  }}
                                />
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
            </div>
          </div>
          <div className="w-full mx-auto mt-3">
            <h1 className="text-lg md:text-xl font-semibold">Leads Summary</h1>

            {/* Dropdown to select graph type */}
            <div className="mt-2">
              <Select
                value={selectedGraph}
                onChange={handleGraphChange}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="PieChart">Lead Status</option>
                <option value="anotherGraph">Lead Category</option>
                <option value="sourceGraph">Lead Source</option>
                {/* Add more options as needed */}
              </Select>
            </div>

            {!loading && statusChartData && (
              <div className="mx-auto mt-2  w-full p-10">
                {selectedGraph === "PieChart" && (
                  <PieChart
                    labels={statusChartData.labels}
                    data={statusChartData.data}
                    ChartColors={statusChartData.ChartColors}
                  />
                )}

                {selectedGraph === "anotherGraph" && (
                  <PieChart
                    labels={chartData.labels}
                    data={chartData.data}
                    ChartColors={chartData.ChartColors}
                  />
                )}

                {selectedGraph === "sourceGraph" && (
                  <PieChart
                    labels={sourceChartData.labels}
                    data={sourceChartData.data}
                    ChartColors={sourceChartData.ChartColors}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bulk WhatsApp Sender</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              mb={2}
            />
            <Input
              placeholder="Template Language"
              value={templateLang}
              onChange={(e) => setTemplateLang(e.target.value)}
              mb={2}
            />
            {components.slice(1).map((component, index) => (
              <Input
                key={index + 1}
                placeholder={`Component Text ${index + 1}`}
                value={component.text}
                onChange={(e) =>
                  handleComponentChange(index + 1, e.target.value)
                }
                mb={2}
              />
            ))}
            <Box className="flex items-center justify-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault(), addComponent;
                }}
                colorScheme="orange"
              >
                Add Component
              </Button>
              <Button
                onClick={(e) => sendMessages(e)}
                isLoading={loading}
                colorScheme="blue"
              >
                {loading ? "Sending..." : "Send Messages"}
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Leads;
