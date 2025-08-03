import React from "react";

// Main App component

// Dashboard component
function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <KeyStats />
      <PrioritySection />
      <ImpactSection />
      <TopCategories />
      <TopTags />
    </div>
  );
}

// Key Stats section component
function KeyStats(props) {
  const stats = [
    {
      title: "Reports",
      value: 271,
      color: "bg-red-600",
      icon: "M12 4.5v15m7.5-7.5h-15",
    }, // Example icon path
    {
      title: "Entities",
      value: 47,
      color: "bg-gray-800",
      icon: "M12 4.5v15m7.5-7.5h-15",
    },
    {
      title: "Collections",
      value: 6,
      color: "bg-orange-600",
      icon: "M12 4.5v15m7.5-7.5h-15",
    },
  ];

  return (
    <section className="mb-2">
      <h2 className="text-xl font-semibold mb-2 ">
        KEY STATS: SUBMITTED, APPROVED, FLAGGED
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={` p-2 flex flex-col items-center justify-center bg-red-700`}
        >
          <div className="flex items-start">
            <span className="text-red-700">.</span>
            <div className="items-center text-center">
              <span className=" font-semibold text-[1.1em] text-center mb-3">
                POP
              </span>

              <div className="text-5xl font-bold mb-2 text-center">{props?.dashboardStats?.count_of_posts}</div>
              <div className="text-lg text-center">Reports</div>
            </div>
            <span>⋮</span>
          </div>
        </div>
        <div
          className={` p-2 flex flex-col items-center justify-center bg-gray-800`}
        >
          <div className="flex items-start">
            <span className="text-gray-800">.</span>
            <div className="items-center text-center">
              <span className=" font-semibold text-[1.1em] text-center mb-3">
                POP
              </span>

              <div className="text-5xl font-bold mb-2 text-center">{props?.dashboardStats?.count_of_entities}</div>
              <div className="text-lg text-center">Entities</div>
            </div>
            <span>⋮</span>
          </div>
        </div>
        <div
          className={` p-2 flex flex-col items-center justify-center bg-orange-600`}
        >
          <div className="flex items-start">
            <span className="text-orange-600">.</span>
            <div className="items-center text-center">
              <span className=" font-semibold text-[1.1em] text-center mb-3">
                POP
              </span>

              <div className="text-5xl font-bold mb-2 text-center">{props?.dashboardStats?.count_of_collections}</div>
              <div className="text-lg text-center">Collections</div>
            </div>
            <span>⋮</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Priority section component
function PrioritySection(props) {
  const {
    count_of_high_priority = 0,
    count_of_medium_priority = 0,
    count_of_low_priority = 0
  } = props?.dashboardStats || {};

  // Calculate max width for scaling (using the highest count)
  const maxPriority = Math.max(count_of_high_priority, count_of_medium_priority, count_of_low_priority, 1);

  return (
    <section className="mb-2">
      <h2 className="text-xl font-semibold mb-1.5 text-[0.97em]">PRIORITY</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-0">
          <div className="flex items-start justify-start">
            <span className="h-2.5 w-2.5 rounded-full mr-2 bg-red-700 mt-1"></span>
            <span className="flex-1 text-red-700 font-semibold text-[0.85em]">High Priority</span>
          </div>
          <div className="flex items-start justify-start">
            <span className="h-2.5 w-2.5 rounded-full mr-2 bg-orange-600 mt-1"></span>
            <span className="flex-1 text-orange-600 font-semibold text-[0.85em]">Medium Priority</span>
          </div>
          <div className="flex items-start justify-start">
            <span className="h-2.5 w-2.5 rounded-full mr-2 bg-blue-500 mt-1"></span>
            <span className="flex-1 text-blue-500 font-semibold text-[0.85em]">Low Priority</span>
          </div>
        </div>
        <div className="p-0 flex flex-col gap-3 items-start justify-start">
          <div className="w-full bg-gray-700 h-2.5 mr-0">
            <div
              className="h-2.5 bg-red-700"
              style={{ width: `${(count_of_high_priority / maxPriority) * 100}%` }}
            ></div>
          </div>
          <div className="w-full bg-gray-700 h-2.5 mr-0">
            <div
              className="h-2.5 bg-orange-600"
              style={{ width: `${(count_of_medium_priority / maxPriority) * 100}%` }}
            ></div>
          </div>
          <div className="w-full bg-gray-700 h-2.5 mr-0">
            <div
              className="h-2.5 bg-blue-500"
              style={{ width: `${(count_of_low_priority / maxPriority) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="p-0 grid grid-cols-3 gap-1 items-center justify-center text-center">
          <div className="bg-red-700 h-full pt-2 flex flex-col">
            <span className="text-[0.9em]">{count_of_high_priority}</span>
            <span className="text-[0.6em]">Reports</span>
          </div>
          <div className="bg-orange-600 h-full pt-2 flex flex-col">
            <span className="text-[0.9em]">{count_of_medium_priority}</span>
            <span className="text-[0.6em]">Reports</span>
          </div>
          <div className="bg-blue-500 h-full pt-2 flex flex-col">
            <span className="text-[0.9em]">{count_of_low_priority}</span>
            <span className="text-[0.6em]">Reports</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Impact section component
function ImpactSection(props) {
  const {
    count_of_high_impact = 0,
    count_of_medium_impact = 0,
    count_of_low_impact = 0
  } = props?.dashboardStats || {};

  // Calculate max width for scaling (using the highest count)
  const maxImpact = Math.max(count_of_high_impact, count_of_medium_impact, count_of_low_impact, 1);

  return (
    <section className="mb-2">
      <h2 className="text-xl font-semibold mb-1.5 text-[0.96em]">IMPACT</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-0">
          <div className="flex items-start justify-start">
            <span className="h-2.5 w-2.5 rounded-full mr-2 bg-red-700 mt-1"></span>
            <span className="flex-1 text-red-700 font-semibold text-[0.85em]">High Impact</span>
          </div>
          <div className="flex items-start justify-start">
            <span className="h-2.5 w-2.5 rounded-full mr-2 bg-orange-600 mt-1"></span>
            <span className="flex-1 text-orange-600 font-semibold text-[0.85em]">Medium Impact</span>
          </div>
          <div className="flex items-start justify-start">
            <span className="h-2.5 w-2.5 rounded-full mr-2 bg-blue-500 mt-1"></span>
            <span className="flex-1 text-blue-500 font-semibold text-[0.85em]">Low Impact</span>
          </div>
        </div>
        <div className="p-0 flex flex-col gap-3 items-start justify-start">
          <div className="w-full bg-gray-700 h-2.5 mr-0">
            <div
              className="h-2.5 bg-red-700"
              style={{ width: `${(count_of_high_impact / maxImpact) * 100}%` }}
            ></div>
          </div>
          <div className="w-full bg-gray-700 h-2.5 mr-0">
            <div
              className="h-2.5 bg-orange-600"
              style={{ width: `${(count_of_medium_impact / maxImpact) * 100}%` }}
            ></div>
          </div>
          <div className="w-full bg-gray-700 h-2.5 mr-0">
            <div
              className="h-2.5 bg-blue-500"
              style={{ width: `${(count_of_low_impact / maxImpact) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="p-0 grid grid-cols-3 gap-1 items-center justify-center text-center">
          <div className="bg-red-700 h-full pt-1 flex flex-col">
            <span className="text-[0.9em]">{count_of_high_impact}</span>
            <span className="text-[0.6em]">Reports</span>
          </div>
          <div className="bg-orange-600 h-full pt-1 flex flex-col">
            <span className="text-[0.9em]">{count_of_medium_impact}</span>
            <span className="text-[0.6em]">Reports</span>
          </div>
          <div className="bg-blue-500 h-full pt-1 flex flex-col">
            <span className="text-[0.9em]">{count_of_low_impact}</span>
            <span className="text-[0.6em]">Reports</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Top Categories section component
function TopCategories(props) {
  const topCategories = props?.dashboardTopAnalytics?.top_categories || [];

  // Calculate max count for scaling
  const maxCategoryCount = topCategories.length > 0
    ? Math.max(...topCategories.map(cat => cat.post_count), 1)
    : 1;

  return (
    <section className="mb-3">
      <div className="flex flex-col items-start pt-0 mt-0">
        <div className="grid grid-cols-2 gap-0.5">
          <span className="text-xl font-semibold mb-2 bg-gray-400 p-1 pt-1 w-full text-black py-1">
            Top <span className="bg-gray-700 text-white">03:</span> Categories:
          </span>
          <span className="w-full"> </span>
        </div>

        {topCategories.slice(0, 3).map((category, index) => (
          <div key={index} className="grid grid-cols-2 gap-0 w-full p-0 mt-0">
            <span className="text-xl font-semibold w-full py-0 text-[0.95em] capitalize">
              {category?.category_name || 'N/A'}
            </span>
            <div className="w-full h-3 mr-0 p-0">
              <div
                className="h-6 bg-gray-400 p-1 text-black"
                style={{
                  width: `${((category?.post_count || 0) / maxCategoryCount) * 100}%`,
                  minWidth: 'fit-content' // Ensures the count is always visible
                }}
              >
                {category?.post_count || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Top Tags section component
function TopTags(props) {
  const topTags = props?.dashboardTopAnalytics?.top_tags || [];

  // Calculate max count for scaling
  const maxTagCount = topTags.length > 0
    ? Math.max(...topTags.map(tag => tag.post_count), 1)
    : 1;

  return (
    <section className="mb-4">
      <div className="flex flex-col items-start pt-0 mt-0">
        <div className="grid grid-cols-2 gap-0.5">
          <span className="text-xl font-semibold mb-1 bg-gray-400 p-1 px-4 w-full text-black py-0">
            Top <span className="bg-gray-700 text-white">03:</span> Tags:
          </span>
          <span className="w-full"> </span>
        </div>

        {topTags.slice(0, 3).map((tag, index) => (
          <div key={index} className="grid grid-cols-2 gap-0.5 w-full p-0">
            <span className="text-xl font-semibold w-full text-[0.99em] capitalize py-0">
              #{tag?.tag_name || 'N/A'}
            </span>
            <div className="w-full h-3 mr-0">
              <div
                className="h-6 bg-gray-400 p-1 text-black"
                style={{
                  width: `${((tag?.post_count || 0) / maxTagCount) * 100}%`,
                  minWidth: 'fit-content'
                }}
              >
                {tag?.post_count || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function MiddleSection(props) {
  return (
    <div className="container mx-auto p-4">
      <KeyStats dashboardStats={props?.dashboardStats}
          dashboardTopAnalytics={props?.dashboardTopAnalytics}/>
      <PrioritySection dashboardStats={props?.dashboardStats}
          dashboardTopAnalytics={props?.dashboardTopAnalytics} />
      <ImpactSection dashboardStats={props?.dashboardStats}
          dashboardTopAnalytics={props?.dashboardTopAnalytics} />
      <TopCategories
          dashboardTopAnalytics={props?.dashboardTopAnalytics}/>
      <TopTags
          dashboardTopAnalytics={props?.dashboardTopAnalytics} />
    </div>
  );
}
export default MiddleSection;
