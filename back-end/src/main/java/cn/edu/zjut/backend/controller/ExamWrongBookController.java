package cn.edu.zjut.backend.controller;

import cn.edu.zjut.backend.po.ExamWrongBook;
import cn.edu.zjut.backend.service.ExamWrongBookService;
import cn.edu.zjut.backend.util.Response;
import cn.edu.zjut.backend.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ExamWrongBookController {

    @Autowired
    @Qualifier("examWrongBookServ")
    private ExamWrongBookService examWrongBookServ;

    @RequestMapping(value = "/api/examWrongBook", method = RequestMethod.GET)
    @ResponseBody
    public Response<List<ExamWrongBook>> examWrongBook() {
        try{
            List<ExamWrongBook> examWrongBookList = examWrongBookServ.queryExamWrongBookByStudentId(UserContext.getUserId());
            return Response.success(examWrongBookList);
        }catch (Exception e){
            e.printStackTrace();
            return Response.error(e.getMessage());
        }
    }
}
