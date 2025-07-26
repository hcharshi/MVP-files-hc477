import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as MdIcons from "react-icons/md";

export const SideBarData = [
  {
    title: "Home",
    path: "/",
    ico: AiIcons.AiFillHome,
    cName: "nav-text",
  },
  {
    title: "Login",
    path: "/Login",
    ico: FaIcons.FaSignInAlt,
    cName: "nav-text",
  },
  {
    title: "Register",
    path: "/Register",
    ico: FaIcons.FaUserPlus,
    cName: "nav-text",
  },
  {
    title: "Profile",
    path: "/Profile",
    ico: FaIcons.FaUser,
    cName: "nav-text",
  },
  {
    title: "Participate",
    path: "/Participate",
    ico: FaIcons.FaGamepad,
    cName: "nav-text",
  },
  {
    title: "Create Question",
    path: "/CreateQuestion",
    ico: MdIcons.MdQuestionAnswer,
    cName: "nav-text",
  },
  {
    title: "Update Question",
    path: "/UpdateQuestion",
    ico: FaIcons.FaEdit,
    cName: "nav-text",
  },
  {
    title: "Admin Create",
    path: "/CreateQuestionManual",
    ico: FaIcons.FaUserShield,
    cName: "nav-text",
  },
  {
    title: "Leaderboard",
    path: "/Leaderboard",
    ico: FaIcons.FaTrophy,
    cName: "nav-text",
  },
];