import { useState, useContext, useEffect } from "react";
import ParallaxSectionEdit from "./ParallaxSectionEdit";
// import ContentSectionEdit from "./ContentSectionEdit";
import ContentManager from "./ContentSectionEdit"
import NewSectionEdit from "./NewSectionEdit";
import ProjectShowcaseEdit from "./ProjectShowcaseEdit";
import ApiContext from "../../context/ApiContext";


const Home = () => {
  const [cmsData, setCmsData] = useState([]);
  const { fetchData } = useContext(ApiContext);
  
  useEffect(() => {
    const fetchAllCMSContent = async () => {
      try {
        const endpoint = "home/getAllCMSContent";
        const method = "GET";
        const headers = {
          "Content-Type": "application/json",
        };

        const response = await fetchData(endpoint, method, {}, headers);
        console.log("response is:", response)

        if (response.success) {
          setCmsData(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch CMS content");
        }
      } catch (error) {
        console.error("Error fetching CMS content:", error);
        Swal.fire("Error", `Failed to fetch CMS content: ${error.message}`, "error");
      }
    };

    fetchAllCMSContent();
  }, [fetchData]);

  const getSectionData = (componentIdName, componentName) => {
    return cmsData.filter(
      (item) => 
        item.ComponentIdName === componentIdName && 
        item.ComponentName === componentName
    );
  };
  
  
  return (
    <div>
      <ParallaxSectionEdit data={getSectionData("parallaxText", "Parallax")} />
      <ContentManager data={getSectionData("contentSection", "ContentSection")} />
      <NewSectionEdit data={getSectionData("news_section", "Latest News")} />
      <ProjectShowcaseEdit data={getSectionData("project_showcase", "ProjectShowcase")}/>
    </div>
  );
};

export default Home;
