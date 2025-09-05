using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

namespace GuestMeetUp.Models
{
    public class GuestInfoModel
    {
        [Required(ErrorMessage = "Event Name")]
        public string EventName { get; set; } = "AI Summit";

        [Required(ErrorMessage = "Event Name")]
        public string Designation  { get; set; } = "AI Summit";
        [Required(ErrorMessage = "College Short Name")]
        public string CollegeShortName { get; set; }

        [Required(ErrorMessage = "Please Enter Name")]
        [Display(Name = "Name")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Please Enter Organisation Name")]
        [Display(Name = "College/Organisation Name")]
        public string CollegeOrgName { get; set; }

        [Required(ErrorMessage = "Please Enter Birth Year")]
        [Display(Name = "Birth Year")]
        public int BirthYear { get; set; }

        [Display(Name = "Gender")]
        public string Gender { get; set; }

        [Display(Name = "Guest Type")]
        public string GuestType { get; set; }

        [Required(ErrorMessage = "Please Enter Valid Email")]
        [Display(Name = "Email")]
        [EmailAddress]
        public string EmailAddress { get; set; }

        [Required(ErrorMessage = "Please enter valid mobile number")]
        [Display(Name = "Mobile Number")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Select Meal Preferences")]
        [Display(Name = "Meal Preferences")]
        public string MealType { get; set; }

        [Required(ErrorMessage = "Select Pick-Up and Drop-off service for airport")]
        [Display(Name = "Pick-Up and Drop-off service for  airport")]
        public string TransportRequired { get; set; } = "No";

        [Required(ErrorMessage = "Address Required")]
        [Display(Name = "Address")]
        public string Address { get; set; }

        [Display(Name = "Accompanied by Spouse ?")]
        public Spouse GSpouse { get; set; }

        public int returnCode { get; set; }

        public string GuestId { get; set; }

        [Required]
        [Display(Name = "Any other Request")]
        public string OtherRequest { get; set; }


        [Required]
        [Display(Name = "Guest Age")]
        public string GuestAge { get; set; }

        [Required]
        [Display(Name = "Spouse Age")]
        public string GuestSpouseAge { get; set; }
        [Required]
        [Display(Name = "Photo")]
        public IFormFile userfile { get; set; }
        public byte[] FileData { get; set; }

        public string GuestPhoto { get; set; }
        //public ImageFileRecord imageFileRecord { get; set; }

        [Required]
        [Display(Name = "ID Proof")]
        public string? GuestProof { get; set; }
        public List<SelectListItem> GuestIdProof { get; set; }

        [Required]
        [Display(Name = "ID Proof Upload")]
        public IFormFile userIdProof { get; set; }
        public byte[] ProofIdFileData { get; set; }

        [Required]
        [Display(Name = "Spouse ID Proof")]
        public string? GuestSpouseProof { get; set; }
        public List<SelectListItem> GuestSpouseIdProof { get; set; }

        [Required]
        [Display(Name = "ID Proof Upload")]
        public IFormFile userSpouseIdProof { get; set; }
        public byte[] ProofIdSpouseFileData { get; set; }
    }

    public class Spouse
    {
        [Required(ErrorMessage = "Please Enter Name")]
        [Display(Name = "Spouse Name")]
        public string SpouseName { get; set; }

        [Required(ErrorMessage = "Please Enter Birth Year")]
        [Display(Name = "Birth Year")]
        public int SpousBirthYear { get; set; }

        [Required(ErrorMessage = "Select Meal Preferences")]
        [Display(Name = "Meal Preferences")]
        public string SpousMealType { get; set; }
    }


}
