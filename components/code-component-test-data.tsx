import { useDatabase } from "@/hooks/use-database"

export function CodeComponentTestData() {
  const { addCodeComponent, projects } = useDatabase()
  
  const createSampleComponents = async () => {
    const sampleComponents = [
      {
        name: "Hero Section",
        description: "Modern hero section with gradient background and call-to-action",
        category: "section" as const,
        tags: ["hero", "landing", "gradient", "cta"],
        code_json: {
          type: "section",
          elements: [
            {
              type: "container",
              settings: {
                layout: "boxed",
                content_width: "1200px"
              },
              elements: [
                {
                  type: "heading",
                  settings: {
                    title: "Welcome to Our Platform",
                    size: "xxl",
                    color: "#ffffff"
                  }
                },
                {
                  type: "text",
                  settings: {
                    text: "Build amazing websites with our powerful tools",
                    color: "#e0e0e0"
                  }
                },
                {
                  type: "button",
                  settings: {
                    text: "Get Started",
                    link: "#signup",
                    style: "primary"
                  }
                }
              ]
            }
          ]
        },
        elementor_data: {
          "version": "3.16.0",
          "title": "Hero Section",
          "type": "section",
          "content": [
            {
              "id": "hero-section",
              "elType": "section",
              "settings": {
                "background_background": "gradient",
                "background_color": "#6366f1",
                "background_color_b": "#a855f7",
                "padding": {
                  "unit": "px",
                  "top": "100",
                  "right": "0",
                  "bottom": "100",
                  "left": "0"
                }
              },
              "elements": [
                {
                  "id": "hero-container",
                  "elType": "container",
                  "settings": {
                    "content_width": "boxed"
                  },
                  "elements": [
                    {
                      "id": "hero-heading",
                      "elType": "widget",
                      "widgetType": "heading",
                      "settings": {
                        "title": "Welcome to Our Platform",
                        "size": "xxl",
                        "color": "#ffffff",
                        "typography_typography": "custom",
                        "typography_font_weight": "700"
                      }
                    }
                  ]
                }
              ]
            }          ]
        },
        project_id: projects[0]?.id ? parseInt(String(projects[0].id)) : 1,
      },
      {
        name: "Contact Form",
        description: "Responsive contact form with validation",
        category: "widget" as const,
        tags: ["form", "contact", "validation", "responsive"],
        code_json: {
          type: "widget",
          form_fields: [
            {
              type: "text",
              label: "Name",
              required: true,
              placeholder: "Your full name"
            },
            {
              type: "email",
              label: "Email",
              required: true,
              placeholder: "your@email.com"
            },
            {
              type: "textarea",
              label: "Message",
              required: true,
              placeholder: "Your message here..."
            }
          ],
          submit_button: {
            text: "Send Message",
            action: "submit_form"
          }
        },
        elementor_data: {
          "version": "3.16.0",
          "title": "Contact Form",
          "type": "widget",
          "widgetType": "form",
          "content": {
            "form_fields": [
              {
                "custom_id": "name",
                "field_type": "text",
                "field_label": "Name",
                "required": "true",
                "placeholder": "Your full name",
                "field_options": "",
                "width": "100"
              },
              {
                "custom_id": "email",
                "field_type": "email",
                "field_label": "Email",
                "required": "true",
                "placeholder": "your@email.com",
                "width": "100"
              },
              {
                "custom_id": "message",
                "field_type": "textarea",
                "field_label": "Message",
                "required": "true",
                "placeholder": "Your message here...",
                "rows": "5"
              }
            ],
            "submit_button_text": "Send Message",
            "form_style": "modern"
          }        },
        project_id: projects[0]?.id ? parseInt(String(projects[0].id)) : 1,
      },
      {
        name: "Feature Card",
        description: "Modern feature card with icon and description",
        category: "element" as const,
        tags: ["card", "feature", "icon", "modern"],
        code_json: {
          type: "card",
          layout: "vertical",
          components: {
            icon: {
              type: "icon",
              library: "fontawesome",
              value: "fas fa-star"
            },
            title: {
              type: "heading",
              level: "h3",
              text: "Amazing Feature"
            },
            description: {
              type: "text",
              content: "This is a description of the amazing feature that will help your business grow."
            },
            button: {
              type: "link",
              text: "Learn More",
              url: "#feature"
            }
          }
        },
        elementor_data: {
          "version": "3.16.0",
          "title": "Feature Card",
          "type": "widget",
          "widgetType": "icon-box",
          "settings": {
            "selected_icon": {
              "value": "fas fa-star",
              "library": "fa-solid"
            },
            "title_text": "Amazing Feature",
            "description_text": "This is a description of the amazing feature that will help your business grow.",
            "link": {
              "url": "#feature",
              "is_external": "",
              "nofollow": ""
            },
            "position": "top",
            "icon_space": {
              "unit": "px",
              "size": 20
            },
            "icon_primary_color": "#6366f1",
            "title_color": "#1f2937",
            "description_color": "#6b7280"
          }        },
        project_id: projects[0]?.id ? parseInt(String(projects[0].id)) : 1,
      }
    ]

    try {
      for (const component of sampleComponents) {
        await addCodeComponent(component)
      }
      alert("Sample components created successfully!")
    } catch (error) {
      console.error("Error creating sample components:", error)
      alert("Error creating sample components")
    }
  }

  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
      <h3 className="font-semibold mb-2">Test Data</h3>
      <p className="text-sm text-gray-600 mb-3">
        Create sample WordPress Elementor components for testing
      </p>
      <button 
        onClick={createSampleComponents}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Sample Components
      </button>
    </div>
  )
}
