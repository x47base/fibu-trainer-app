interface Link {
    name: string;
    path: string;
    adminrequired: boolean;
}

const links: Link[] = [
    {
        name: "Home",
        path: "/",
        adminrequired: false,
    },
    {
        name: "Train",
        path: "/train",
        adminrequired: false,
    },
    {
        name: "History",
        path: "/history",
        adminrequired: false,
    },
    {
        name: "Dashboard",
        path: "/dashboard",
        adminrequired: false,
    }
];

export default links;
