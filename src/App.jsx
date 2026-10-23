import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import OpportunityDetails from "./pages/OpportunityDetails";
import Saved from "./pages/Saved";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import SkillGap from "./pages/SkillGap";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="explore" element={<Explore />} />
        <Route path="opportunities/:id" element={<OpportunityDetails />} />
        <Route path="saved" element={<Saved />} />
        <Route path="applications" element={<Applications />} />
        <Route path="skills" element={<SkillGap />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
