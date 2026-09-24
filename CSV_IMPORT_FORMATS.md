# CSV Import Templates

The Admin/Faulty bulk import buttons use these column formats:

- Students: `name,email,password,course_id,enrollment_status`
- Faculty: `name,email,password,dept_id`
- Courses: `dept_id,coursename,dur_yrs,seats`
- Departments: `dept_name`
- Marks: `student_id,subject_id,score,exam_type`

Use the **Template** button on each page to download a blank CSV with the correct headers.
IDs such as `course_id`, `dept_id`, `student_id`, and `subject_id` must already exist in the database.
